<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>权限列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区 -->
    <el-card>
      <!-- 添加角色按钮 -->
      <el-row>
        <el-col>
          <el-button type="primary" @click="addRoleDialog">添加角色</el-button>
        </el-col>
      </el-row>
      <!-- 角色列表 -->
      <el-table :data="rolesList" style="width: 100%" border stripe>
        <el-table-column type="expand">
          <template slot-scope="scope">
            <!-- 一级权限 -->
            <el-row v-for="(item, index) in scope.row.children" :key="item.id" :class="['border_bottom', index === 0 ? 'border_top' : '', 'flex_center']">
              <el-col :span="5">
                <el-tag type="primary">{{ item.authName }}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>

              <el-col :span="19">
                <!-- 二级权限 -->
                <el-row v-for="(item2, index2) in item.children" :key="item2.id" :class="[index2 === 0 ? '' : 'border_top', 'flex_center']">
                  <el-col :span="6">
                    <el-tag type="success">{{ item2.authName }}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <!-- 三级权限 -->
                  <el-col :span="18">
                    <el-tag type="warning" v-for="item3 in item2.children" :key="item3.id" closable @close="tagClose(scope.row, item3.id)">{{ item3.authName }}</el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>

          </template>
        </el-table-column>
        <el-table-column type="index" label="序号" width="60px"></el-table-column>
        <el-table-column prop="roleName" label="角色名称"></el-table-column>
        <el-table-column prop="roleDesc" label="角色描述"></el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="edditRoleDialog(scope.row.id)">编辑</el-button>
            <el-button type="danger" icon="el-icon-delete" size="mini" @click="roleDelete(scope.row.id)">删除</el-button>
            <el-button type="warning" icon="el-icon-setting" size="mini" @click="addRightsDialog(scope.row)">分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 添加角色对话框 -->
    <el-dialog title="添加角色" :visible.sync="addRoleDialogVisible" width="50%" @close="addRoleDialogClose">
      <el-form :model="addRoleForm" :rules="addRoleFormRules" ref="addRoleFormRef" label-width="100px">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="addRoleForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="addRoleForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addRole">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 修改角色对话框 -->
    <el-dialog title="修改角色" :visible.sync="edditRoleDialogVisible" width="50%" @close="edditRoleDialogClose">
      <el-form :model="edditRoleForm" :rules="edditRoleFormRules" ref="edditRoleFormRef" label-width="100px">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="edditRoleForm.roleName"></el-input>
        </el-form-item>
        <!--  prop="roleDesc" -->
        <el-form-item label="角色描述">
          <el-input v-model="edditRoleForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="edditRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="edditRole">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 分配权限的对话框 -->
    <el-dialog title="分配权限" :visible.sync="addRightsDialogVisible" width="50%" @close="rightsDialogClose">
      <!-- 对话框内容 -->
      <el-tree :data="rightsList" :props="rightsProps" ref="rightsTreeRef" show-checkbox node-key="id" default-expand-all :default-checked-keys="selectedRightsList"></el-tree>
      <!-- 对话框底部 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addRightsDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addRights">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data () {
    return {
      // 角色列表
      rolesList: [],
      // 分配权限对话框
      addRightsDialogVisible: false,
      // 权限列表
      rightsList: [],
      rightsProps: {
        label: 'authName',
        children: 'children'
      },
      selectedRightsList: [],
      selectRoleId: 0,
      addRoleDialogVisible: false,
      // 添加角色表单对象
      addRoleForm: {
        roleName: '',
        roleDesc: ''
      },
      addRoleFormRules: {
        roleName: [
          { required: true, message: '请输入角色名称', trigger: 'blur' }
        ]
      },
      // 修改用户角色对话框
      edditRoleDialogVisible: false,
      edditRoleForm: {},
      edditRoleFormRules: {
        roleName: [
          { required: true, message: '请输入角色名称', trigger: 'blur' }
        ]
      }
    }
  },
  created () {
    this.getRolesList()
  },
  methods: {
    // 获取用户列表
    async getRolesList () {
      const { data: res } = await this.$axios.get('/roles')
      if (res.meta.status !== 200) {
        return this.$message.error('角色列表获取失败')
      }
      this.rolesList = res.data
    },
    // 关闭标签
    async tagClose (role, rightId) {
      const result = await this.$confirm('此操作将永久删除该权限, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(error => error)

      if (result !== 'confirm') {
        return this.$message.info('删除权限操作已经取消')
      }
      const { data: res } = await this.$axios.delete(`/roles/${role.id}/rights/${rightId}`)
      if (res.meta.status !== 200) {
        return this.$message.error('权限删除失败')
      }
      role.children = res.data
    },
    // 分配权限对话框
    async addRightsDialog (role) {
      this.selectRoleId = role.id
      const { data: res } = await this.$axios.get('/rights/tree')
      if (res.meta.status !== 200) {
        this.$message.error('权限列表获取失败')
      }
      this.rightsList = res.data
      this.getSelectedRightsList(role, this.selectedRightsList)

      this.addRightsDialogVisible = true
    },
    // 获取指定角色下的三级权限列表
    getSelectedRightsList (node, array) {
      if (!node.children) {
        return array.push(node.id)
      }
      node.children.forEach(element => {
        this.getSelectedRightsList(element, array)
      })
    },
    // 关闭分配权限的对话框
    rightsDialogClose () {
      this.selectedRightsList = []
    },
    // 授权
    async addRights () {
      const keys = [
        ...this.$refs.rightsTreeRef.getCheckedKeys(),
        ...this.$refs.rightsTreeRef.getHalfCheckedKeys()
      ]
      const { data: res } = await this.$axios.post(`/roles/${this.selectRoleId}/rights`, {
        rids: keys.join(',')
      })
      if (res.meta.status !== 200) {
        return this.$message.error('授权失败')
      }
      this.$message.success('授权成功')
      this.addRightsDialogVisible = false
      this.getRolesList()
    },
    // 添加角色对话框
    addRoleDialog () {
      this.addRoleDialogVisible = true
    },
    addRoleDialogClose () {
      this.$refs.addRoleFormRef.resetFields()
    },
    addRole () {
      this.$refs.addRoleFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$axios.post('/roles', this.addRoleForm)
        if (res.meta.status !== 201) {
          return this.$message.error('添加角色失败')
        }
        this.getRolesList()
        this.addRoleDialogVisible = false
      })
    },
    // 修改角色对话框
    async edditRoleDialog (id) {
      const { data: res } = await this.$axios.get('/roles/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error('角色获取失败')
      }
      this.edditRoleForm = res.data
      this.edditRoleDialogVisible = true
    },
    edditRoleDialogClose () {
      this.$refs.edditRoleFormRef.resetFields()
    },
    edditRole () {
      console.log(this.edditRoleForm)
      this.$refs.edditRoleFormRef.validate(async valid => {
        if (!valid) return

        const { data: res } = await this.$axios.put('/roles/' + this.edditRoleForm.roleId, {
          roleName: this.edditRoleForm.roleName,
          roleDesc: this.edditRoleForm.roleDesc
        })
        if (res.meta.status !== 200) {
          return this.$message.error('角色编辑失败')
        }
        this.getRolesList()
        this.edditRoleDialogVisible = false
      })
    },
    // 根据id删除角色
    async roleDelete (id) {
      const result = await this.$confirm('此操作将永久删除该角色, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(error => error)

      if (result !== 'confirm') {
        return this.$message.info('删除操作已经取消')
      }
      const { data: res } = await this.$axios.delete('/roles/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error('角色删除失败')
      }
      this.getRolesList()
    }
  }
}
</script>

<style lang="less" scoped>
  .el-table{
    margin-top: 10px;
  }
  .el-tag{
    margin: 10px 10px 10px 0;
  }
  .border_top{
    border-top: 1px solid #eee;
  }
  .border_bottom{
    border-bottom: 1px solid #eee;
  }
  .flex_center{
    display: flex;
    align-items: center;
  }
</style>
