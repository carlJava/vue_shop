<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区 -->
    <el-card>
      <!-- 用户列表查询区 -->
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input placeholder="请输入用户名" v-model="queryInfo.query" clearable @clear="getUsersList" @change="getUsersList">
            <el-button slot="append" icon="el-icon-search" @click="getUsersList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="addUsersDialog">添加用户</el-button>
        </el-col>
      </el-row>
      <!-- 用户列表展示区 -->
      <el-table :data="usersList" style="width: 100%" border stripe>
        <el-table-column type="index" label="序号"></el-table-column>
        <el-table-column prop="username" label="姓名" width="100px"></el-table-column>
        <el-table-column prop="email" label="邮箱" width="170px"></el-table-column>
        <el-table-column prop="mobile" label="电话" width="115px"></el-table-column>
        <el-table-column label="日期" width="170px">
          <template slot-scope="scope">
            {{ scope.row.create_time|dateFormat }}
          </template>
        </el-table-column>
        <el-table-column prop="role_name" label="角色" width="100px"></el-table-column>
        <el-table-column label="状态" width="80px">
          <template slot-scope="scope">
            <el-switch v-model="scope.row.mg_state" active-color="#409EFF" inactive-color="#909399"
            @change="changeState(scope.row.id, scope.row.mg_state)"></el-switch>
          </template>
        </el-table-column>
        <el-table-column prop="date" label="操作">
          <template slot-scope="scope">
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="edditUsersDialog(scope.row.id)"></el-button>
            <el-button type="danger" icon="el-icon-delete" size="mini" @click="deleteUsers(scope.row.id)"></el-button>
            <el-tooltip class="item" effect="dark" content="分配角色" placement="top" :enterable="false">
              <el-button type="warning" icon="el-icon-setting" size="mini" @click="addRoleDialog(scope.row)"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页区 -->
      <el-pagination background @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="queryInfo.pagenum"
      :page-sizes="[1, 2, 3, 4]" :page-size="queryInfo.pagesize" layout="total, sizes, prev, pager, next, jumper" :total="total"></el-pagination>
    </el-card>

    <!-- 添加用户信息的对话框 -->
    <el-dialog title="添加用户" :visible.sync="addUsersDialogVisible" width="50%" @close="addUsersDialogClose">
      <!-- 对话框的主题内容 -->
      <el-form :model="addUsersForm" :rules="addUsersFormRules" ref="addUsersFormRef" label-width="100px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addUsersForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addUsersForm.password"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addUsersForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="addUsersForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <!-- 对话框的脚部确认 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addUsersDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUsers">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 修改用户信息的对话框 -->
    <el-dialog title="修改用户" :visible.sync="edditUsersDialogVisible" width="50%" @close="edditUsersDialogClose">
      <!-- 对话框的主题内容 -->
      <el-form :model="edditUsersForm" :rules="edditUsersFormRules" ref="edditUsersFormRef" label-width="100px">
        <el-form-item label="用户名">
          <el-input v-model="edditUsersForm.username" :disabled="true"></el-input>
        </el-form-item>
        <el-form-item label="邮箱地址" prop="email">
          <el-input v-model="edditUsersForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机号" prop="mobile">
          <el-input v-model="edditUsersForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <!-- 对话框的脚部确认 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="edditUsersDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="edditUsers">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 分配角色对话框 -->
    <el-dialog title="提示" :visible.sync="addRoleDialogVisible" width="50%" @close="roleDialogClose">
      <el-form ref="roleFormRef" :model="roleForm" label-width="100px">
        <el-form-item label="用户名:">
          {{ roleForm.username }}
        </el-form-item>
        <el-form-item label="当前角色:">
          {{ roleForm.role_name }}
        </el-form-item>
        <el-form-item label="分配新角色:">
          <el-select v-model="roleId" placeholder="请选择">
            <el-option v-for="item in rolesList" :key="item.id" :label="item.roleName" :value="item.id"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addRoles">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data () {
    // 自定义邮箱校验规则
    const checkEmail = (rule, value, callback) => {
      const emailRegx = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/
      if (emailRegx.test(value)) {
        return callback()
      }
      callback(new Error('请输入合法的邮箱地址'))
    }
    // 自定义手机号校验规则
    const checkMobile = (rule, value, callback) => {
      const mobileRegx = /^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/
      if (mobileRegx.test(value)) {
        return callback()
      }
      callback(new Error('请输入合法的手机号'))
    }
    return {
      /*
      查询参数：
        query：查询关键字
        pagenum：当前页码
        pagesize：每页显示的条数
      */
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 2
      },
      usersList: [],
      total: 0,
      addUsersDialogVisible: false,
      edditUsersDialogVisible: false,
      // 添加用户信息的表单对象
      addUsersForm: {
        username: '',
        password: '',
        email: '',
        mobile: ''
      },
      addUsersFormRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 15, message: '长度在 3 到 15 个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入用密码', trigger: 'blur' },
          { min: 3, max: 15, message: '长度在 3 到 15 个字符', trigger: 'blur' }
        ],
        email: [
          { required: true, message: '请输入用户密码', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          { validator: checkMobile, trigger: 'blur' }
        ]
      },
      // 修改用户信息的表单对象
      edditUsersForm: {},
      edditUsersFormRules: {
        email: [
          { required: true, message: '请输入用户密码', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          { validator: checkMobile, trigger: 'blur' }
        ]
      },
      // 分配用户角色对话框的显示与隐藏
      addRoleDialogVisible: false,
      // 角色对话框表单对象
      roleForm: {},
      // 角色列表
      rolesList: [],
      // 被选中的角色Id
      roleId: ''
    }
  },
  created () {
    this.getUsersList()
  },
  methods: {
    // 获取用户列表数据
    async getUsersList () {
      this.queryInfo.query = this.queryInfo.query.trim()
      const { data: res } = await this.$axios.get('/users', {
        params: this.queryInfo
      })
      if (res.meta.status !== 200) {
        this.$message.error('用户列表获取失败')
      }
      this.usersList = res.data.users
      this.total = res.data.total
    },
    // 每页显示条数改变时触发
    handleSizeChange (pagesize) {
      this.queryInfo.pagesize = pagesize
      this.getUsersList()
    },
    // 当前页码改变时触发
    handleCurrentChange (pagenum) {
      this.queryInfo.pagenum = pagenum
      this.getUsersList()
    },
    // 改变用户状态
    async changeState (id, state) {
      const { data: res } = await this.$axios.put(`/users/${id}/state/${state}`)
      if (res.meta.status !== 200) {
        return this.$message.error('用户状态设置失败')
      }
      this.$message.success('用户状态设置成功')
    },
    // 显示添加用户信息对话框
    addUsersDialog () {
      this.addUsersDialogVisible = true
    },
    addUsersDialogClose () {
      this.$refs.addUsersFormRef.resetFields()
    },
    // 添加用户
    addUsers () {
      this.$refs.addUsersFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$axios.post('/users', this.addUsersForm)
        if (res.meta.status !== 201) {
          return this.$message.error('用户创建失败')
        }
        this.addUsersDialogVisible = false
        this.getUsersList()
      })
    },
    // 显示修改用户信息对话框,同时进行用户信息数据的回显
    async edditUsersDialog (id) {
      const { data: res } = await this.$axios.get('/users/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error('用户信息获取失败')
      }
      this.edditUsersForm = res.data
      this.edditUsersDialogVisible = true
    },
    // 关闭修改用户信息对话框时重置表单数据
    edditUsersDialogClose () {
      this.$refs.edditUsersFormRef.resetFields()
    },
    // 修改用户信息
    edditUsers () {
      this.$refs.edditUsersFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$axios.put('/users/' + this.edditUsersForm.id, {
          email: this.edditUsersForm.email,
          mobile: this.edditUsersForm.mobile
        })
        if (res.meta.status !== 200) {
          return this.$message.error('用户信息修改失败')
        }
        this.edditUsersDialogVisible = false
        this.getUsersList()
      })
    },
    // 删除用户
    async deleteUsers (id) {
      const confirm = await this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(error => error)

      if (confirm === 'cancel') {
        return this.$message.info('删除用户操作已经取消')
      }
      const { data: res } = await this.$axios.delete('/users/' + id)
      console.log(res)
      if (res.meta.status !== 200) {
        return this.$message.error('删除用户失败')
      }
      this.getUsersList()
    },
    // 弹出分配用户角色对话框
    addRoleDialog (user) {
      this.roleForm = user
      this.addRoleDialogVisible = true
      this.getRolesList()
    },
    // 获取角色列表
    async getRolesList () {
      const { data: res } = await this.$axios.get('/roles')
      if (res.meta.status !== 200) {
        return this.$message.error('获取角色列表失败')
      }
      this.rolesList = res.data
    },
    roleDialogClose () {
      this.roleForm = {}
      this.roleId = ''
    },
    async addRoles () {
      const { data: res } = await this.$axios.put(`/users/${this.roleForm.id}/role`, {
        rid: this.roleId
      })
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      }
      this.$message.success('用户角色分配成功')
      this.addRoleDialogVisible = false
      this.getUsersList()
    }
  }
}
</script>

<style lang="less" scoped>
  .el-table{
    margin-top: 10px;
  }
</style>
