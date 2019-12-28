<template>
  <el-container class="container">
    <!-- 头部区域 -->
    <el-header>
      <div>
        <img src="../assets/heima.png" alt="logo">
        <span>电商后台管理系统</span>
      </div>
      <el-button type="info" @click="logout">安全退出</el-button>
    </el-header>

    <el-container>
      <!-- 侧边栏 -->
      <el-aside :width="isCollapse ? '64px' : '200px'">
        <div class="asideToggle" @click="asideToggle">|||</div>
        <!-- 菜单栏 -->
        <el-menu background-color="#545c64" text-color="#fff" active-text-color="#ffd04b"
        unique-opened router :collapse="isCollapse" :collapse-transition="false">
        <!-- 一级菜单 -->
          <el-submenu :index="item.id + ''" v-for="item in menuList" :key="item.id">
            <!-- 一级菜单的列表内容 -->
            <template slot="title">
              <i :class="menuIcon[item.id]"></i>
              <span class="ml_5">{{ item.authName }}</span>
            </template>

            <!-- 二级菜单 -->
            <el-menu-item :index="'/' + subItem.path" v-for="subItem in item.children" :key="subItem.id">
              <i class="el-icon-menu"></i>
              <span slot="title">{{ subItem.authName }}</span>
            </el-menu-item>
          </el-submenu>
        </el-menu>

      </el-aside>

      <!-- 内容主题区 -->
      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  data () {
    return {
      // 左侧菜单列表
      menuList: [],
      // 左侧菜单列表的图标
      menuIcon: {
        '125': 'iconfont icon-users',
        '103': 'iconfont icon-kongjianfenxi',
        '101': 'iconfont icon-baobao',
        '102': 'iconfont icon-danju-tianchong',
        '145': 'iconfont icon-baobiao'
      },
      // 侧边栏菜单是否展开
      isCollapse: false
    }
  },
  created () {
    this.getMenuList()
  },
  methods: {
    // 获取左侧菜单列表
    async getMenuList () {
      const { data: res } = await this.$axios.get('/menus')
      if (res.meta.status !== 200) {
        return this.$message.error('菜单列表获取失败')
      }
      this.menuList = res.data
    },
    // 用户安全退出
    logout () {
      window.sessionStorage.clear()
      this.$router.push('/login')
    },
    // to
    asideToggle () {
      this.isCollapse = !this.isCollapse
    }
  }
}
</script>

<style lang="less" scoped>
  .el-header{
    background-color: #545c64;
    color: white;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-left: 0;
    div{
      display: flex;
      align-items: center;
      font-size: 20px;
      img{
        margin-right: 10px;
      }
    }
  }
  .el-aside{
    background-color: #545c64;
    color: white;
  }
  .container{
    height: 100%;
  }
  .ml_5{
    margin-left: 5px;
  }
  .el-menu{
    border: none;
  }
  .asideToggle{
    background-color: pink;
    color: white;
    display: block;
    width: 100%;
    text-align: center;
    padding-bottom: 2px;
  }
</style>
