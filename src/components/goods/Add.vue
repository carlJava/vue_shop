<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区 -->
    <el-card>
      <!-- 提示信息 -->
      <el-alert title="添加商品信息" type="info" center show-icon :closable="false"></el-alert>
      <!-- 步骤条 -->
      <el-steps :active="activeName - 0" finish-status="success" align-center>
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>
      <!-- 纵向标签页导航 -->
      <el-form :model="addGoodsForm" :rules="addGoodsFormRules" ref="addGoodsFormRef" label-width="100px" label-position="top">
        <el-tabs v-model="activeName" @tab-click="tabsClick" :before-leave="beforeTabsLeave" tab-position="left">
          <!-- 基本信息标签页 -->
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="addGoodsForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input v-model.number="addGoodsForm.goods_price" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input v-model.number="addGoodsForm.goods_weight" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input v-model.number="addGoodsForm.goods_number" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品分类" prop="goods_cat">
              <el-cascader v-model="addGoodsForm.goods_cat" :options="cateList" :props="cateProps"
              expand-trigger="hover" @change="handleChange"></el-cascader>
            </el-form-item>
          </el-tab-pane>

          <!-- 商品参数标签页 -->
          <el-tab-pane label="商品参数" name="1">
            <el-form-item :label="item.attr_name" v-for="item in manyAttr" :key="item.attr_id">
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox v-for="(cb, i) in item.attr_vals" :key="i" :label="cb" border size="small"></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>

          <!-- 商品属性标签页 -->
          <el-tab-pane label="商品属性" name="2">
            <el-form-item :label="item.attr_name" v-for="item in onlyAttr" :key="item.attr_id">
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>

          <!-- 商品图片标签页 -->
          <el-tab-pane label="商品图片" name="3">
            <el-upload :action="uploadUrl" list-type="picture" :headers="uploadHeaders" :on-success="uploadSuccess"
            :on-remove="removeFile" :on-preview="picPreview">
              <el-button size="small" type="primary">点击上传</el-button>
            </el-upload>
          </el-tab-pane>
          <!-- 商品内容标签页 -->
          <el-tab-pane label="商品内容" name="4">
            <!-- v-model：将富文本编辑器中的内容双向绑定到商品添加表单对象中 -->
            <quill-editor v-model="addGoodsForm.goods_introduce"></quill-editor>
            <el-button type="primary" @click="addGoods">添加商品</el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>
    <!-- 图片预览对话框 -->
    <el-dialog title="图片预览" :visible.sync="picPreviewDialogVisible" width="45%">
      <img :src="picPath" width="100%"/>
    </el-dialog>
  </div>
</template>

<script>
import _ from 'lodash'
export default {
  data () {
    return {
      // 标签页激活项
      activeName: '0',
      // 添加商品表单数据
      addGoodsForm: {
        goods_name: '',
        goods_price: 0,
        goods_weight: 0,
        goods_number: 0,
        goods_cat: [],
        attrs: [],
        pics: [],
        goods_introduce: ''
      },
      addGoodsFormRules: {
        goods_name: [
          { required: true, message: '请输入商品名称', trigger: 'blur' }
        ],
        goods_price: [
          { required: true, message: '请输入商品价格', trigger: 'blur' },
          { type: 'number', min: 0.01, message: '商品价格不能为0', trigger: 'blur' }
        ],
        goods_weight: [
          { required: true, message: '请输入商品重量', trigger: 'blur' }
        ],
        goods_number: [
          { required: true, message: '请输入商品数量', trigger: 'blur' },
          { type: 'number', min: 1, message: '商品数量不能为0', trigger: 'blur' }
        ],
        goods_cat: [
          { required: true, message: '请选择商品分类', trigger: 'blur' }
        ]
      },
      // 商品分类列表
      cateList: [],
      // 商品分类级联选择器的配置对象
      cateProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      manyAttr: [],
      onlyAttr: [],
      // 文件上传路径
      uploadUrl: 'http://127.0.0.1:8888/api/private/v1/upload',
      uploadHeaders: {
        Authorization: window.sessionStorage.getItem('token')
      },
      // 图片预览路径
      picPath: '',
      picPreviewDialogVisible: false
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
    // 当商品分类级联选择器的值改变时触发
    handleChange () {
      if (this.addGoodsForm.goods_cat.length !== 3) {
        this.addGoodsForm.goods_cat = []
      }
    },
    beforeTabsLeave (activeName, oldActiveName) {
      // 本想校验表单成功后,才放行的,结果无法实现。(感觉这样更合理，只是能力有限)
      if (oldActiveName === '0' && this.addGoodsForm.goods_cat.length !== 3) {
        this.$message.error('请选择商品分类')
        return false
      }
      return true
    },
    // 标签页切换时触发
    async tabsClick () {
      if (this.activeName === '1') {
        const { data: res } = await this.$axios.get(`/categories/${this.addGoodsForm.goods_cat[2]}/attributes`, {
          params: { sel: 'many' }
        })
        if (res.meta.status !== 200) {
          return this.$message.error('商品参数获取失败')
        }
        res.data.forEach(item => {
          item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
        })
        this.manyAttr = res.data
      } else if (this.activeName === '2') {
        const { data: res } = await this.$axios.get(`/categories/${this.addGoodsForm.goods_cat[2]}/attributes`, {
          params: { sel: 'only' }
        })
        if (res.meta.status !== 200) {
          return this.$message.error('商品属性获取失败')
        }
        this.onlyAttr = res.data
      }
    },
    // 图片上传成功后调用
    uploadSuccess (response) {
      this.addGoodsForm.pics.push({
        pic: response.data.tmp_path
      })
    },
    // 移除上传的文件
    removeFile (file) {
      const index = this.addGoodsForm.pics.findIndex(item => {
        return item.pic === file.response.data.tmp_path
      })
      this.addGoodsForm.pics.splice(index, 1)
    },
    // 上传成功后的图片预览
    picPreview (file) {
      this.picPath = file.response.data.url
      this.picPreviewDialogVisible = true
    },
    // 添加商品
    addGoods () {
      // 1、验证表单数据是否填写完整
      this.$refs.addGoodsFormRef.validate(async valid => {
        if (!valid) {
          return this.$message.error('请将必填项填写完整')
        }
        // 2、转换表单数据的格式，使其满足要求
        // 对 goods_cat 进行处理
        const goodsForm = _.cloneDeep(this.addGoodsForm)
        goodsForm.goods_cat = goodsForm.goods_cat.join(',')

        // 对动态参数 manyAttr 进行处理
        this.manyAttr.forEach(item => {
          const newInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals.join(' ')
          }
          goodsForm.attrs.push(newInfo)
        })

        // 对动态参数 onlyAttr 进行处理
        this.onlyAttr.forEach(item => {
          const newInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals
          }
          goodsForm.attrs.push(newInfo)
        })
        // 3、调用接口API，将商品信息保存到数据库中，从而实现添加商品操作。
        const { data: res } = await this.$axios.post('/goods', goodsForm)
        if (res.meta.status !== 201) {
          // '商品添加失败'
          return this.$message.error(res.meta.msg)
        }
        this.$router.push('/goods')
      })
    }
  }
}
</script>

<style lang="less" scoped>
  .el-steps{
    margin: 15px;
  }
  .el-checkbox{
    margin: 5px !important;
  }
</style>
