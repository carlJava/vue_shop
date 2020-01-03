import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'
import axios from 'axios'
import TableTree from 'vue-table-with-tree-grid'

// 导入富文本编辑器
import VueQuillEditor from 'vue-quill-editor'

import './assets/css/global.css'
// 导入字体文件的样式
import './assets/fonts/iconfont.css'
// 导入富文本编辑器对应的样式
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'
import 'quill/dist/quill.bubble.css'

Vue.prototype.$axios = axios
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
Vue.component('table-tree', TableTree)
// 将富文本编辑器注册为全局可用的组件
Vue.use(VueQuillEditor)

// 请求拦截器
axios.interceptors.request.use(config => {
  config.headers.Authorization = window.sessionStorage.getItem('token')
  return config
})

// 时间过滤器
Vue.filter('dateFormat', (value) => {
  const date = new Date(value)

  const y = date.getFullYear()
  const m = (date.getMonth() + 1 + '').padStart(2, '0')
  const d = (date.getDate() + '').padStart(2, '0')

  const hh = (date.getHours() + '').padStart(2, '0')
  const mm = (date.getMinutes() + '').padStart(2, '0')
  const ss = (date.getSeconds() + '').padStart(2, '0')
  return `${y}-${m}-${d} ${hh}:${mm}:${ss}`
})
Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
