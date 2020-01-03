<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区 -->
    <el-card>
      <!-- 订单搜索区 -->
      <el-row>
        <el-col :span="8">
          <el-input placeholder="请输入订单名称" v-model="queryInfo.query" clearable @clear="getOrdersList" @change="getOrdersList">
            <el-button slot="append" icon="el-icon-search" @click="getOrdersList"></el-button>
          </el-input>
        </el-col>
      </el-row>
      <!-- 订单列表展示区 -->
      <el-table :data="ordersList" border stripe>
        <el-table-column type="index" label="序号"></el-table-column>
        <el-table-column prop="order_number" label="订单编号" width="200px"></el-table-column>
        <el-table-column prop="order_price" label="订单价格"></el-table-column>
        <el-table-column label="是否付款">
          <template slot-scope="scope">
            <el-tag type="success" v-if="scope.row.pay_status === '1'">已付款</el-tag>
            <el-tag type="danger" v-else>未付款</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="is_send" label="是否发货"></el-table-column>
        <el-table-column label="下单时间">
          <template slot-scope="scope">
            {{ scope.row.create_time | dateFormat }}
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="ordderAddressDialog"></el-button>
            <el-button type="success" icon="el-icon-location" size="mini" @click="transportDialog(scope.row.order_id)"></el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页区 -->
      <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="queryInfo.pagenum" background
      :page-sizes="[5, 10, 15, 20]" :page-size="queryInfo.pagesize" layout="total, sizes, prev, pager, next, jumper" :total="total"> </el-pagination>
    </el-card>

    <!-- 修改订单地址对话框 -->
    <el-dialog title="修改订单地址" :visible.sync="orderAddressDialogVisible" width="50%" @close="orderAddressDialogClose">
      <el-form :model="orderAddressForm" :rules="orderAddressRules" ref="orderAddressRef" label-width="100px">
        <el-form-item label="省市区/县" prop="address1">
          <el-cascader v-model="orderAddressForm.address1" :options="city" :props="addressProps" expand-trigger="hover" @change="handleChange"></el-cascader>
        </el-form-item>
        <el-form-item label="详细地址" prop="address2">
          <el-input v-model="orderAddressForm.address2"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="orderAddressDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="orderAddressDialogVisible = false">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 查看物流信息对话框 -->
    <el-dialog title="查看物流信息" :visible.sync="transportDialogVisible" width="50%">
      <el-timeline :reverse="true">
        <el-timeline-item v-for="(activity, index) in activities" :key="index" :timestamp="activity.ftime">
          {{activity.context}}
        </el-timeline-item>
      </el-timeline>
    </el-dialog>
  </div>
</template>

<script>
import cityData from './citydata'
export default {
  data () {
    return {
      // 查询参数
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 5
      },
      // 订单列表
      ordersList: [],
      // 订单总数
      total: 0,
      // 订单地址对话框
      orderAddressDialogVisible: false,
      orderAddressForm: {},
      orderAddressRules: {
        address1: [
          { required: true, message: '请输入省市区/县', trigger: 'blur' }
        ],
        address2: [
          { required: true, message: '请输入详细地址', trigger: 'blur' }
        ]
      },
      city: cityData,
      addressProps: {
        value: 'value',
        label: 'label',
        children: 'children'
      },
      // 查看物流信息对话框
      transportDialogVisible: false,
      activities: []
    }
  },
  created () {
    this.getOrdersList()
  },
  methods: {
    // 获取订单列表
    async getOrdersList () {
      const { data: res } = await this.$axios.get('/orders', {
        params: this.queryInfo
      })
      if (res.meta.status !== 200) {
        return this.$message.error('订单列表获取失败')
      }
      this.ordersList = res.data.goods
      this.total = res.data.total
    },
    // 每页显示条数改变时触发
    handleSizeChange (pagesize) {
      this.queryInfo.pagesize = pagesize
      this.getOrdersList()
    },
    // 当页码改变时触发
    handleCurrentChange (pagenum) {
      this.queryInfo.pagenum = pagenum
      this.getOrdersList()
    },
    ordderAddressDialog () {
      this.orderAddressDialogVisible = true
    },
    orderAddressDialogClose () {
      this.$refs.orderAddressRef.resetFields()
    },
    handleChange () {
      console.log(this.orderAddressForm)
    },
    async transportDialog (id) {
      // 获取物流信息
      const { data: res } = await this.$axios.get('/kuaidi/1106975712662')
      if (res.meta.status !== 200) {
        return this.$message.error('物流信息获取失败')
      }
      this.activities = res.data
      this.transportDialogVisible = true
    }
  }
}
</script>

<style lang="less" scoped>
  @import '../../plugins/timeline/timeline.css';
  @import '../../plugins/timeline-item/timeline-item.css';
  .el-table{
    width: 100%;
    margin: 10px 0;
    font-size: 12px;
  }
  .el-cascader{
    width: 100%;
  }
</style>
