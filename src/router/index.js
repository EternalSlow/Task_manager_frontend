import { createRouter, createWebHashHistory } from 'vue-router'

// Импортируйте ваши компоненты-страницы
// (Предположим, они лежат в src/views/)
import Login from '../view/Login.vue'
import Dashboard from '../view/dashboard.vue'

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: Login },
  { path: '/dashboard', component: Dashboard },
  // добавьте другие маршруты, например, /profile, /settings...
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

export default router