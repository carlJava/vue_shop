<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>参数列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区 -->
    <el-card>
      <el-alert title="注意：只允许为第三级分类设置相关参数" type="warning" show-icon :closable="false"></el-alert>
      <el-row class="m_top10">
        <el-col>
          <span>选择商品分类：</span>
          <el-cascader v-model="selectedIds" :options="cateList" :props="cateProps"
          @change="handleChange" expand-trigger="hover"></el-cascader>
        </el-col>
      </el-row>
      <!-- 标签页 -->
      <el-tabs v-model="activeName" @tab-click="handleClick">
        <el-tab-pane label="动态参数" name="many">
          <el-button type="primary" :disabled="isBtnDisabled" class="m_bottom10" @click="addParamDialog">添加参数</el-button>
          <!-- 动态参数列表 -->
          <el-table :data="manyData" style="width: 100%" stripe border>
            <el-table-column type="expand">
              <template slot-scope="scope">
                <el-tag type="primary" v-for="(item, index) in scope.row.attr_vals" :key="index" closable
                @close="closeTag(scope.row, index)">{{item}}</el-tag>
                <!-- 动态编辑标签 -->
                <el-input class="input-new-tag" v-if="scope.row.inputVisible" v-model="scope.row.inputValue" ref="saveTagInput" size="small"
                @keyup.enter.native="handleInputConfirm(scope.row)" @blur="handleInputConfirm(scope.row)">
                </el-input>
                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
              </template>
            </el-table-column>
            <el-table-column type="index" label="序号" width="80px"></el-table-column>
            <el-table-column prop="attr_name" label="参数名称"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button type="primary" icon="el-icon-edit" size="mini" @click="editParamDialog(scope.row)">修改</el-button>
                <el-button type="danger" icon="el-icon-delete" size="mini" @click="deleteParam(scope.row.attr_id)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <!-- 静态属性面板 -->
        <el-tab-pane label="静态属性" name="only">
          <el-button type="primary" :disabled="isBtnDisabled" class="m_bottom10" @click="addParamDialog">添加属性</el-button>
          <el-table :data="onlyData" style="width: 100%" stripe border>
            <el-table-column type="expand">

              <template slot-scope="scope">
                <el-tag type="primary" v-for="(item, index) in scope.row.attr_vals" :key="index" closable
                @close="closeTag(scope.row, index)">{{item}}</el-tag>
                <!-- 动态编辑标签 -->
                <el-input class="input-new-tag" v-if="scope.row.inputVisible" v-model="scope.row.inputValue" ref="saveTagInput" size="small"
                @keyup.enter.native="handleInputConfirm(scope.row)" @blur="handleInputConfirm(scope.row)">
                </el-input>
                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
              </template>

            </el-table-column>
            <el-table-column type="index" label="序号" width="80px"></el-table-column>
            <el-table-column prop="attr_name" label="属性名称"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button type="primary" icon="el-icon-edit" size="mini" @click="editParamDialog(scope.row)">修改</el-button>
                <el-button type="danger" icon="el-icon-delete" size="mini" @click="deleteParam(scope.row.attr_id)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 添加动态参数或静态属性的对话框 -->
    <el-dialog :title="'添加' + tittleText" :visible.sync="addParamsDialogVisible" width="50%" @close="addParamDialogClose">
      <el-form :model="addParamsForm" :rules="addParamsFormRules" ref="addParamsFormRef" label-width="100px">
        <el-form-item :label="tittleText" prop="attr_name">
          <el-input v-model="addParamsForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addParamsDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addParams">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 修改动态参数或静态属性的对话框 -->
    <el-dialog :title="'修改' + tittleText" :visible.sync="editParamsDialogVisible" width="50%" @close="editParamDialogClose">
      <el-form :model="editParamForm" :rules="editParamFormRules" ref="editParamFormRef" label-width="100px">
        <el-form-item :label="tittleText" prop="attr_name">
          <el-input v-model="editParamForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editParamsDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editParams">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data () {
    return {
      // 商品分类列表
      cateList: [],
      // 商品分类级联选择器的配置对象
      cateProps: {
        label: 'cat_name',
        value: 'cat_id',
        children: 'children'
      },
      // 商品分类级联选择器选中的id数组
      selectedIds: [],
      // 激活的标签页
      activeName: 'many',
      manyData: [],
      onlyData: [],
      // 添加参数或属性的对话框
      addParamsDialogVisible: false,
      addParamsForm: {},
      addParamsFormRules: {
        attr_name: [
          { required: true, message: '请输入参数', trigger: 'blur' }
        ]
      },
      // 修改参数或属性的对话框
      editParamsDialogVisible: false,
      editParamForm: {},
      editParamFormRules: {
        attr_name: [
          { required: true, message: '请输入参数', trigger: 'blur' }
        ]
      }
    }
  },
  created () {
    this.getCateList()
  },
  methods: {
    // 获取商品分类列表
    async getCateList () {
      const { data: res } = await this.$axios.get('/categories')
      if (res.meta.status !== 200) {
        return this.$message.error('商品分类列表获取失败')
      }
      this.cateList = res.data
    },
    // 商品分类级联选择器的值改变时触发
    handleChange () {
      this.getParams()
    },
    // 标签页切换时触发
    handleClick () {
      this.getParams()
    },
    // 如果获取静态属性的话,这里有点儿小问题:不应该对 attr_vals 进行改变  ,同时静态属性在展示的时候也有点儿小问题???
    async getParams () {
      if (this.selectedIds.length !== 3) {
        this.selectedIds = []
        this.manyData = []
        this.onlyData = []
        return
      }
      const { data: res } = await this.$axios.get(`/categories/${this.selectedIds[2]}/attributes`, {
        params: { sel: this.activeName }
      })

      // attr_vals: "49吋4K超薄曲面 人工智能,55吋4K观影曲面 30核HDR,55吋4K超薄曲面 人工智能,65吋4K超薄曲面 人工智能 好好学习，天天向上"
      // 注：对于动态参数的处理，感觉还好。但是对静态属性的处理，感觉就不行了。应该像商品添加页面中的处理可能会感觉得更好一些。
      res.data.forEach(element => {
        element.attr_vals = element.attr_vals ? element.attr_vals.split(' ') : []
        element.inputVisible = false
        element.inputValue = ''
      })

      if (this.activeName === 'many') {
        this.manyData = res.data
      } else {
        this.onlyData = res.data
      }
    },
    showInput (row) {
      row.inputVisible = true
      // 让文本框自动获得焦点：$nextTick 方法的作用，就是当页面上元素被重新渲染之后，才会指定回调函数中的代码
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus()
      })
    },
    // 添加动态参数的可选项
    handleInputConfirm (row) {
      const inputValue = row.inputValue.trim()
      if (inputValue) {
        row.attr_vals.push(inputValue)
        this.saveTagInput(row)
      }
      row.inputValue = ''
      row.inputVisible = false
    },
    // 修改动态参数
    async saveTagInput (row) {
      const { data: res } = await this.$axios.put(`categories/${this.selectedIds[2]}/attributes/${row.attr_id}`, {
        attr_name: row.attr_name,
        attr_sel: row.attr_sel,
        attr_vals: row.attr_vals.join(' ')
      })
      if (res.meta.status !== 200) {
        this.$message.error('可选参数保存失败')
      }
    },
    // 删除动态参数的可选项
    closeTag (row, index) {
      row.attr_vals.splice(index, 1)
      this.saveTagInput(row)
    },
    // 删除动态参数
    async deleteParam (id) {
      const confirm = await this.$confirm('此操作将永久删除该动态参数, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(error => error)

      if (confirm !== 'confirm') {
        return this.$message.info('删除操作已经取消')
      }

      const { data: res } = await this.$axios.delete(`/categories/${this.selectedIds[2]}/attributes/${id}`)
      if (res.meta.status !== 200) {
        return this.$message.error('动态参数删除失败')
      }
      this.getParams()
    },
    // 弹出添加属性的对话框
    addParamDialog () {
      this.addParamsDialogVisible = true
    },
    // 关闭添加属性对话框
    addParamDialogClose () {
      this.$refs.addParamsFormRef.resetFields()
    },
    // 添加属性
    addParams () {
      this.$refs.addParamsFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$axios.post(`/categories/${this.selectedIds[2]}/attributes`, {
          attr_name: this.addParamsForm.attr_name,
          attr_sel: this.activeName
        })
        if (res.meta.status !== 201) {
          return this.$message.error('添加属性失败')
        }
        this.addParamsDialogVisible = false
        this.getParams()
      })
    },
    // 显示修改动态参数或静态属性的对话框
    async editParamDialog (row) {
      const { data: res } = await this.$axios.get(`/categories/${this.selectedIds[2]}/attributes/${row.attr_id}`, {
        params: {
          attr_sel: row.attr_sel
        }
      })
      if (res.meta.status !== 200) {
        return this.$message.error('参数获取失败')
      }
      this.editParamForm = res.data
      this.editParamsDialogVisible = true
    },
    editParamDialogClose () {
      this.$refs.editParamFormRef.resetFields()
    },
    editParams () {
      this.$refs.editParamFormRef.validate(async valid => {
        if (!valid) return
        // 至于使用哪一种方法,取决于服务器端是如何获取数据的：对象.xxx
        /* const { data: res } = await this.$axios.put(`/categories/${this.selectedIds[2]}/attributes/${this.editParamForm.attr_id}`, {
          attr_name: this.editParamForm.attr_name,
          attr_sel: this.activeName,
          attr_vals: this.editParamForm.attr_vals
        }) */
        const { data: res } = await this.$axios.put(`/categories/${this.selectedIds[2]}/attributes/${this.editParamForm.attr_id}`, this.editParamForm)
        if (res.meta.status !== 200) {
          return this.$message.error('参数修改失败')
        }
        this.editParamsDialogVisible = false
        this.getParams()
      })
    }
  },
  computed: {
    // 如果数组的长度不为3，则禁用按钮 true。否则，就启用按钮 false
    isBtnDisabled () {
      return this.selectedIds.length !== 3
    },
    // 添加属性对话框的标题
    tittleText () {
      return this.activeName === 'many' ? '动态参数' : '静态属性'
    }
  }
}
</script>

<style lang="less" scoped>
  .m_top10{
    margin-top: 10px;
  }
  .m_bottom10{
    margin-bottom: 10px;
  }
  .el-tag{
    margin: 10px 10px 10px 0;
  }
  .input-new-tag{
    width: 180px;
  }
</style>
