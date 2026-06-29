import { createRouter, createWebHashHistory } from 'vue-router'

import Login from '../view/Login.vue'
import Dashboard from '../view/dashboard.vue'
import UserManagement from '../view/UserManament.vue'

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: Login },
  { path: '/dashboard', component: Dashboard },
  { path: '/admin/users', component: UserManagement, meta: { requiresAdmin: true } },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  
  if (to.meta.requiresAdmin) {
    if (!token) {
      next('/login')
    } else if (user.role !== 'admin') {
      next('/dashboard')
    } else {
      next()
    }
  } else {
    next()
  }
})

export default router