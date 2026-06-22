<template>
  <div class="login-container">
    <div class="login-card">
      <div class="logo">
        <div class="logo-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
      </div>

      <h1 class="title">Sign in to your account</h1>

      <form class="login-form" @submit.prevent="handleSubmit">
        <div class="form-group">
          <label for="email" class="form-label">Email address</label>
          <input
            id="email"
            v-model="email"
            type="email"
            class="form-input"
            placeholder="you@example.com"
            required
          />
        </div>

        <div class="form-group">
          <label for="password" class="form-label">Password</label>
          <input
            id="password"
            v-model="password"
            type="password"
            class="form-input"
            placeholder="••••••••"
            required
          />
        </div>

        <div class="form-group checkbox-group">
          <label class="checkbox-label">
            <input v-model="remember" type="checkbox" class="checkbox" />
            <span class="checkbox-text">Remember me</span>
          </label>
        </div>

        <button type="submit" class="btn-submit" :disabled="loading">
          {{ loading ? 'Signing in...' : 'Sign in' }}
        </button>

        <div class="divider">
          <span class="divider-text">Or continue with</span>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue' 
import { useRouter } from 'vue-router' 

const router = useRouter()

const email = ref('')
const password = ref('')
const remember = ref(false)
const loading = ref(false)

const handleSubmit = async () => {
  if (!email.value || !password.value) {
    alert('Please fill in all fields')
    return
  }

  loading.value = true
  try {
    const response = await fetch('http://localhost:5000/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: email.value,
        password: password.value
      })
    })

    const data = await response.json()
    console.log('📡 Статус ответа:', response.status)
    console.log('✅ Ответ сервера:', data)

    if (response.ok) {
      if (data.token) {
        localStorage.setItem('token', data.token)
        localStorage.setItem('user', JSON.stringify(data.user))
      }
      if (remember.value) {
        localStorage.setItem('rememberedEmail', email.value)
      } else {
        localStorage.removeItem('rememberedEmail')
      }
      await router.push('/dashboard')
    } else {
      alert('Ошибка: ' + (data.message || 'Неизвестная ошибка'))
    }
  } catch (err) {
    console.error('❌ Ошибка запроса:', err)
    alert('Ошибка соединения с сервером')
  } finally {
    loading.value = false
  }
}
</script>
<style>
@import './styles.css';
</style>