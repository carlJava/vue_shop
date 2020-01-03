<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区 -->
    <el-card>
      <!-- 搜索区 -->
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getGoodsList" @change="getGoodsList">
            <el-button slot="append" icon="el-icon-search" @click="getGoodsList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="goAddPage">添加商品</el-button>
        </el-col>
      </el-row>

      <!-- 商品列表展示区 -->
      <el-table :data="goodsList" border stripe>
        <el-table-column type="index" label="序号" width="50px"></el-table-column>
        <el-table-column prop="goods_name" label="商品名称"></el-table-column>
        <el-table-column prop="goods_price" label="商品价格(元)" width="95px"></el-table-column>
        <el-table-column prop="goods_weight" label="商品重量" width="70px"></el-table-column>
        <el-table-column label="创建时间" width="145px">
          <template slot-scope="scope">
            {{ scope.row.add_time | dateFormat }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120px">
          <template slot-scope="scope">
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="editGoodsDialog(scope.row)"></el-button>
            <el-button type="danger" icon="el-icon-delete" size="mini" @click="deleteGoods(scope.row.goods_id)"></el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页区 -->
      <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="queryInfo.pagenum" background
      :page-sizes="[10, 20, 30, 40]" :page-size="queryInfo.pagesize" layout="total, sizes, prev, pager, next, jumper" :total="total"></el-pagination>
    </el-card>

    <!-- 修改商品信息对话框 -->
    <el-dialog title="修改商品信息" :visible.sync="editGoodsDialogVisible" width="50%">
      <el-form :model="editGoodsForm" :rules="editGoodsFormRules" ref="editGoodsFormRef" label-width="100px">
        <el-form-item label="商品名称" prop="goods_name">
          <el-input v-model="editGoodsForm.goods_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editGoodsDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editGoodsDialogVisible = false">确 定</el-button>
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
        query: '',
        pagenum: 1,
        pagesize: 10
      },
      goodsList: [],
      total: 0,
      editGoodsDialogVisible: false,
      editGoodsForm: {},
      editGoodsFormRules: {
        goods_name: [
          { required: true, message: '请输入商品名称', trigger: 'blur' }
        ],
        goods_price: [],
        goods_number: [],
        goods_weight: []
      }
    }
  },
  created () {
    this.getGoodsList()
  },
  methods: {
    // 查询商品列表
    async getGoodsList () {
      const { data: res } = await this.$axios.get('/goods', {
        params: this.queryInfo
      })
      if (res.meta.status !== 200) {
        return this.$message.error('商品列表查询失败')
      }
      this.goodsList = res.data.goods
      this.total = res.data.total
    },
    // 当每页显示的条数改变时触发
    handleSizeChange (pagesize) {
      this.queryInfo.pagesize = pagesize
      this.getGoodsList()
    },
    // 当前页码改变时触发
    handleCurrentChange (pagenum) {
      this.queryInfo.pagenum = pagenum
      this.getGoodsList()
    },
    // 根据id删除商品
    async deleteGoods (id) {
      const confirm = await this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(error => error)

      if (confirm !== 'confirm') {
        return this.$message.info('删除操作已经取消')
      }
      const { data: res } = await this.$axios.delete('/goods/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error('商品删除失败')
      }
      this.getGoodsList()
    },
    // 显示修改商品对话框
    editGoodsDialog (row) {
      console.log(row.goods_id)
      this.editGoodsDialogVisible = true
    },
    // 跳转到添加页面
    goAddPage () {
      this.$router.push('/goods/add')
    }
  }
}
</script>

<style lang="less" scoped>
  .el-table{
    margin-top: 10px;
    width: 100%;
    font-size: 12px;
  }
</style>
