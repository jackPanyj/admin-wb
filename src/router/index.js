import Vue from 'vue'
import Router from 'vue-router'
import ActDetail from '@/pages/ActDetail'
import Login from '@/pages/Login'
import GMap from '@/pages/Map'

Vue.use(Router)

const routes = [
  {
    path: '/act_detail/:id',
    name: 'ActDetail',
    component: ActDetail
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: {
      title: '为式智能'
    }
  },
  {
    path: '/map',
    name: 'Map',
    component: GMap,
    meta: {
      title: '为式智能 - 鹰眼'
    }
  }
]

const router = new Router({
  mode: 'history',
  base: '/fe/',
  routes,
  scrollBehavior (to, from, savedPosition) {
    return savedPosition || {x: 0, y: 0}
  }
})

router.beforeEach((to, from, next) => {
  document.title = to.meta.title || ''
  next()
})

export default router
