<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>分类列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区 -->
    <el-card>
      <el-row>
        <el-col><el-button type="primary" @click="addCateDialog">添加分类</el-button></el-col>
      </el-row>
      <!-- 商品分类列表 -->
      <!-- <el-table :data="cateList" style="width: 100%" border stripe>
        <el-table-column type="index" label="序号" width="80px"></el-table-column>
        <el-table-column prop="cat_name" label="分类名称"></el-table-column>
        <el-table-column label="是否有效">
          <template slot-scope="scope">
            <i class="el-icon-success" v-if="!scope.row.cat_deleted" style="color: lightgreen"></i>
            <i class="el-icon-error" v-else tstyle="color: red"></i>
          </template>
        </el-table-column>
        <el-table-column label="等级">
          <template slot-scope="scope">
            <el-tag type="primary" v-if="scope.row.cat_level === 0">一级</el-tag>
            <el-tag type="success" v-else-if="scope.row.cat_level === 1">二级</el-tag>
            <el-tag type="warning" v-else>三级</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template>
            <el-button type="primary" icon="el-icon-edit" size="mini">编辑</el-button>
            <el-button type="danger" icon="el-icon-delete" size="mini">删除</el-button>
          </template>
        </el-table-column>
      </el-table> -->

      <!-- 商品分类列表 -->
      <table-tree :data="cateList" :columns="columns" :expand-type="false" :selection-type="false" show-index border>
        <!-- 是否有效 -->
        <template slot="isOk" slot-scope="scope">
          <i class="el-icon-success" v-if="!scope.row.cat_deleted" style="color: lightgreen"></i>
          <i class="el-icon-error" v-else tstyle="color: red"></i>
        </template>
        <!-- 等级 -->
        <template slot="level" slot-scope="scope">
          <el-tag type="primary" v-if="scope.row.cat_level === 0">一级</el-tag>
          <el-tag type="success" v-else-if="scope.row.cat_level === 1">二级</el-tag>
          <el-tag type="danger" v-else>三级</el-tag>
        </template>
        <!-- 操作 -->
        <template slot="operate" slot-scope="scope">
          <el-button type="primary" icon="el-icon-edit" size="mini" @click="editCateDialog(scope.row.cat_id)">编辑</el-button>
          <el-button type="danger" icon="el-icon-delete" size="mini" @click="deleteCate(scope.row.cat_id)">删除</el-button>
        </template>
      </table-tree>
      <!-- 分页 -->
      <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="queryInfo.pagenum"
      :page-sizes="[5, 10, 15, 20]" :page-size="queryInfo.pagesize" layout="total, sizes, prev, pager, next, jumper" :total="total"></el-pagination>
    </el-card>

    <!-- 添加商品分类对话框 -->
    <el-dialog title="添加商品分类" :visible.sync="addCateDialogVisible" width="50%" @close="addCateDialogClose">
      <el-form :model="addCateForm" :rules="addCateFormRules" ref="addCateFormRef" label-width="100px">
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="addCateForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类">
          <!-- <el-input v-model="addCateForm.cat_pid"></el-input> -->
          <!-- <el-select v-model="addCateForm.cat_pid" placeholder="请选择">
            <el-option v-for="item in pCateList" :key="item.cat_id" :label="item.cat_name" :value="item.cat_id"></el-option>
          </el-select> -->
          <el-cascader v-model="selectedPids" :options="pCateList" :props="cascaderProps"
          @change="handleCateChange" expand-trigger="hover" clearable change-on-select></el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCate">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改商品分类对话框 -->
    <el-dialog title="修改商品分类" :visible.sync="editCateDialogVisible" width="50%" @close="editCateDialogClose">
      <el-form :model="editCateForm" :rules="addCateFormRules" ref="editCateFormRef" label-width="100px">
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="editCateForm.cat_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editCate">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data () {
    return {
      // 查询参数
      queryInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5
      },
      // 分类列表
      cateList: [],
      total: 0,
      columns: [
        {
          label: '分类名称',
          prop: 'cat_name'
        },
        {
          label: '是否有效',
          type: 'template',
          template: 'isOk'
        },
        {
          label: '等级',
          type: 'template',
          template: 'level'
        },
        {
          label: '操作',
          type: 'template',
          template: 'operate'
        }
      ],
      // 添加商品分类对话框
      addCateDialogVisible: false,
      // 添加商品分类表单对象
      addCateForm: {
        cat_name: '',
        cat_pid: 0,
        cat_level: 0
      },
      addCateFormRules: {
        cat_name: [
          { required: true, message: '请输入商品分类名称', trigger: 'blur' }
        ]
      },
      // 父级分类
      pCateList: [],
      cascaderProps: {
        value: 'cat_id', // 你所选中的那个值的属性名
        label: 'cat_name', // 你所看到的那个值的属性名
        children: 'children'
      },
      // 父级分类级联选择器中选中的pid数组
      selectedPids: [],
      // 修改商品分类对话框
      editCateDialogVisible: false,
      // 修改商品分类表单对象
      editCateForm: {}
    }
  },
  created () {
    this.getCateList()
  },
  methods: {
    // 获取分类列表
    async getCateList () {
      const { data: res } = await this.$axios.get('/categories', {
        params: this.queryInfo
      })
      if (res.meta.status !== 200) {
        return this.$message.error('分类列表获取失败')
      }
      this.cateList = res.data.result
      this.total = res.data.total
    },
    // 每页条数改变时触发
    handleSizeChange (pagesize) {
      this.queryInfo.pagesize = pagesize
      this.getCateList()
    },
    // 页码改变时触发
    handleCurrentChange (pagenum) {
      this.queryInfo.pagenum = pagenum
      this.getCateList()
    },
    // 弹出添加商品分类对话框
    async addCateDialog () {
      const { data: res } = await this.$axios.get('/categories', {
        params: {
          type: 2
        }
      })
      if (res.meta.status !== 200) {
        return this.$message.error('父级分类获取失败')
      }
      this.pCateList = res.data
      this.addCateDialogVisible = true
    },
    // 当父级分类改变时触发,对添加表单中的数据进行赋值
    handleCateChange () {
      if (this.selectedPids.length > 0) {
        this.addCateForm.cat_pid = this.selectedPids[this.selectedPids.length - 1]
        this.addCateForm.cat_level = this.selectedPids.length
      } else {
        this.addCateForm.cat_pid = 0
        this.addCateForm.cat_level = 0
      }
    },
    // 添加父级分类对话框关闭
    addCateDialogClose () {
      this.$refs.addCateFormRef.resetFields()
      this.addCateForm.cat_pid = 0
      this.addCateForm.cat_level = 0
      this.selectedPids = []
    },
    // 保存商品分类
    addCate () {
      this.$refs.addCateFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$axios.post('/categories', this.addCateForm)
        if (res.meta.status !== 201) {
          return this.$message.error('商品分类添加失败')
        }
        this.getCateList()
        this.addCateDialogVisible = false
      })
    },
    // 删除分类
    async deleteCate (id) {
      const confirm = await this.$confirm('此操作将永久删除该商品分类, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(error => error)
      if (confirm !== 'confirm') {
        return this.$message.info('删除操作已经取消')
      }
      const { data: res } = await this.$axios.delete('/categories/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error('商品分类删除失败')
      }
      this.$message.success('商品分类删除成功')
      this.getCateList()
    },
    // 修改商品分类对话框
    async editCateDialog (id) {
      const { data: res } = await this.$axios.get('/categories/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error('商品分类信息获取失败')
      }
      this.editCateForm = res.data
      console.log(this.editCateForm)
      this.editCateDialogVisible = true
    },
    editCateDialogClose () {
      this.$refs.editCateFormRef.resetFields()
    },
    async editCate () {
      const { data: res } = await this.$axios.put('/categories/' + this.editCateForm.cat_id, {
        cat_name: this.editCateForm.cat_name
      })
      if (res.meta.status !== 200) {
        return this.$message.error('商品分类修改失败')
      }
      this.getCateList()
      this.editCateDialogVisible = false
    }
  }
}
</script>

<style lang="less" scoped>
  .zk-table{
    margin-top: 10px;
  }
  .el-icon-success{
    font-size: 16px;
  }
  .el-cascader{
    width: 100%;
  }
</style>
