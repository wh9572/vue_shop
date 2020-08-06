import Vue from 'vue'
import App from './App.vue'
import router from './router'

import TreeTable from 'vue-table-with-tree-grid'

import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'

// 导入全局样式表
import './assets/css/global.css'
// 导入字体图标
import './assets/fonts/iconfont.css'

import axios from 'axios'

// 导入NProgress
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

// 导入富文本编辑器
import VueQuillEditor from 'vue-quill-editor'
// require styles 导入富文本编辑器对应的样式
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'
import 'quill/dist/quill.bubble.css'

// 配置根路径
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
// 在request 拦截器中,展示进度条 NProgress.start()
axios.interceptors.request.use(config => {
  // console.log(config)
  NProgress.start()
  config.headers.Authorization = window.sessionStorage.getItem('token')

  // 在最后必须 return config
  return config
})
// 在response 拦截器中,隐藏进度条 NProgress.done()
axios.interceptors.response.use(config => {
  NProgress.done()

  // 在最后必须 return config
  return config
})

Vue.prototype.$http = axios

Vue.use(ElementUI)
Vue.component('tree-table', TreeTable)
// 将富文本编辑器 注册为全局可用的组件
Vue.use(VueQuillEditor)

Vue.filter('dateFormat', function(originVal) {
  const dt = new Date(originVal)

  const y = dt.getFullYear()
  const m = (dt.getMonth() + 1 + '').padStart(2, '0')
  const d = (dt.getDate() + '').padStart(2, '0')

  const hh = (dt.getHours() + '').padStart(2, '0')
  const mm = (dt.getUTCMinutes() + '').padStart(2, '0')
  const ss = (dt.getSeconds() + '').padStart(2, '0')

  return `${y}-${m}-${d} ${hh}:${mm}:${ss}`
})

Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
