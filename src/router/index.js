import Vue from 'vue'
import VueRouter from 'vue-router'

const Login = () => import('../views/login/Login')
const Home = () => import('../views/home/Home')
const User = () => import('../views/user/User')
const Auth = () => import('../views/auth/Auth')
const Roles = () => import('../views/auth/Roles')

const Cate = () => import('../views/goods/Cate')
const Params = () => import('../views/goods/Params')

const Welcome = () => import('../components/content/welcome/Welcome')

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: Login,
    component: Login
  },
  {
    path: '/home',
    name: Home,
    component: Home,
    redirect: '/welcome',
    children: [
      {
        path: '/welcome',
        name: Welcome,
        component: Welcome
      },
      {
        path: '/users',
        name: User,
        component: User
      },
      {
        path: '/rights',
        name: Auth,
        component: Auth
      },
      {
        path: '/roles',
        name: Roles,
        component: Roles
      },
      {
        path: '/categories',
        name: Cate,
        component: Cate
      },
      {
        path: '/params',
        name: Params,
        component: Params
      }
    ]
  }
]

const router = new VueRouter({
  routes
})

// 挂载路由导航守卫
router.beforeEach((to, from, next) => {
  // to 将要访问的路径
  // from 代表从那个路径跳转而来
  // next  是一个函数，表示放行

  //  next() 放行   next('/login') 强制跳转
  if (to.path === '/login') return next()
  // 获取token
  const tokenStr = window.sessionStorage.getItem('token')
  if (!tokenStr) return next('/login')
  next()
})

export default router
