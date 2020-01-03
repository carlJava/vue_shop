<template>
  <div class="container">
    <div class="login">
      <!-- logo 区 -->
      <div class="logo">
        <img src="../assets/logo.png" />
      </div>
      <!-- 登录表单 -->
      <el-form :model="loginForm" :rules="loginFormRules" ref="loginFormRef">
        <el-form-item prop="username">
          <el-input v-model="loginForm.username" prefix-icon="iconfont icon-ren" placeholder="请输入用户名"></el-input>
        </el-form-item>
        <el-form-item prop="password">
          <el-input v-model="loginForm.password" prefix-icon="iconfont icon-suo1" placeholder="请输入密码" show-password></el-input>
        </el-form-item>
        <!-- 登录按钮 -->
        <div class="btns">
          <el-button type="primary" @click="login">登录</el-button>
          <el-button type="info" @click="resetForm">重置</el-button>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script>
export default {
  data () {
    return {
      loginForm: {
        username: 'admin',
        password: '123456'
      },
      loginFormRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 15, message: '长度在 3 到 15 个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 3, max: 15, message: '长度在 3 到 15 个字符', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    // 实现登录功能
    login () {
      this.$refs.loginFormRef.validate(async valid => {
        if (!valid) {
          return this.$message.error('输入的用户名或密码不合法')
        }
        const { data: res } = await this.$axios.post('/login', this.loginForm)
        if (res.meta.status !== 200) {
          return this.$message.error('登录失败')
        }
        window.sessionStorage.setItem('token', res.data.token)
        this.$router.push('/home')
      })
    },
    // 重置表单
    resetForm () {
      this.$refs.loginFormRef.resetFields()
    }
  }
}
</script>

<style lang="less" scoped>
  .container{
    background-color: #264969;
    height: 100%;
    .login{
      width: 450px;
      height: 300px;
      background: white;
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%)
    }
    .logo{
        width: 130px;
        height: 130px;
        border-radius: 50%;
        border: 1px solid #eee;
        padding: 10px;
        box-shadow: 0 1px 5px #ddd;
        position: absolute;
        left: 50%;
        transform: translate(-50%, -50%);
        background-color: white;
        img{
          width: 100%;
          height: 100%;
          border-radius: 50%;
          background-color: #eee;
        }
    }
    .el-form{
      padding: 0 20px;
      position: absolute;
      bottom: 20px;
      width: 100%;
      box-sizing: border-box;
      .btns{
        display: flex;
        justify-content: flex-end;
      }
    }
  }
</style>
