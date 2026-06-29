<template>
  <div class="user-management">
    <div class="header">
      <h1>Управление пользователями</h1>
      <button @click="showCreateModal = true" class="btn-primary">
        + Создать пользователя
      </button>
    </div>

    <div class="users-table">
      <table>
        <thead>
          <tr>
            <th>Имя</th>
            <th>Email</th>
            <th>Роль</th>
            <th>Дата создания</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in users" :key="user._id">
            <td>{{ user.name || '—' }}</td>
            <td>{{ user.email }}</td>
            <td>
              <span :class="'role-badge role-' + user.role">
                {{ user.role === 'admin' ? 'Администратор' : 'Пользователь' }}
              </span>
            </td>
            <td>{{ formatDate(user.createdAt) }}</td>
            <td class="actions">
              <button @click="editUser(user)" class="btn-edit">Редактировать</button>
              <button @click="resetPassword(user)" class="btn-reset">Сбросить пароль</button>
              <button @click="deleteUser(user)" class="btn-delete">Удалить</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Модальное окно создания/редактирования -->
    <div v-if="showCreateModal || showEditModal" class="modal-overlay" @click="closeModals">
      <div class="modal" @click.stop>
        <h2>{{ showEditModal ? 'Редактировать пользователя' : 'Создать пользователя' }}</h2>
        <form @submit.prevent="submitForm">
          <div class="form-group">
            <label>Имя</label>
            <input v-model="formData.name" type="text" placeholder="Иван Иванов" />
          </div>
          <div class="form-group">
            <label>Email *</label>
            <input v-model="formData.email" type="email" required placeholder="user@example.com" />
          </div>
          <div class="form-group" v-if="!showEditModal">
            <label>Пароль *</label>
            <input v-model="formData.password" type="password" required placeholder="Минимум 6 символов" />
          </div>
          <div class="form-group">
            <label>Роль</label>
            <select v-model="formData.role">
              <option value="user">Пользователь</option>
              <option value="admin">Администратор</option>
            </select>
          </div>
          <div class="modal-actions">
            <button type="button" @click="closeModals" class="btn-cancel">Отмена</button>
            <button type="submit" class="btn-primary">
              {{ showEditModal ? 'Сохранить' : 'Создать' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Модальное окно сброса пароля -->
    <div v-if="showResetModal" class="modal-overlay" @click="closeModals">
      <div class="modal" @click.stop>
        <h2>Сбросить пароль</h2>
        <p>Пользователь: <strong>{{ selectedUser?.email }}</strong></p>
        <form @submit.prevent="submitResetPassword">
          <div class="form-group">
            <label>Новый пароль *</label>
            <input v-model="newPassword" type="password" required placeholder="Минимум 6 символов" />
          </div>
          <div class="modal-actions">
            <button type="button" @click="closeModals" class="btn-cancel">Отмена</button>
            <button type="submit" class="btn-primary">Сбросить пароль</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Модальное окно подтверждения удаления -->
    <div v-if="showDeleteModal" class="modal-overlay" @click="closeModals">
      <div class="modal" @click.stop>
        <h2>Подтверждение удаления</h2>
        <p>Вы уверены, что хотите удалить пользователя <strong>{{ selectedUser?.email }}</strong>?</p>
        <p class="warning">Это действие нельзя отменить.</p>
        <div class="modal-actions">
          <button @click="closeModals" class="btn-cancel">Отмена</button>
          <button @click="confirmDelete" class="btn-delete">Удалить</button>
        </div>
      </div>
    </div>

    <!-- Уведомления -->
    <div v-if="notification" :class="'notification notification-' + notification.type">
      {{ notification.message }}
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const API_URL = 'http://localhost:5000/api'

const users = ref([])
const showCreateModal = ref(false)
const showEditModal = ref(false)
const showResetModal = ref(false)
const showDeleteModal = ref(false)
const selectedUser = ref(null)
const newPassword = ref('')
const notification = ref(null)

const formData = ref({
  name: '',
  email: '',
  password: '',
  role: 'user'
})

const token = localStorage.getItem('token')
const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Authorization': `Bearer ${token}`
  }
})

onMounted(() => {
  loadUsers()
})

async function loadUsers() {
  try {
    const response = await axiosInstance.get('/users')
    users.value = response.data
  } catch (error) {
    showNotification('Ошибка загрузки пользователей: ' + (error.response?.data?.message || error.message), 'error')
  }
}

function editUser(user) {
  selectedUser.value = user
  formData.value = {
    name: user.name || '',
    email: user.email,
    role: user.role
  }
  showEditModal.value = true
}

function resetPassword(user) {
  selectedUser.value = user
  newPassword.value = ''
  showResetModal.value = true
}

function deleteUser(user) {
  selectedUser.value = user
  showDeleteModal.value = true
}

async function submitForm() {
  try {
    if (showEditModal.value) {
      await axiosInstance.put(`/users/${selectedUser.value._id}`, formData.value)
      showNotification('Пользователь успешно обновлен', 'success')
    } else {
      await axiosInstance.post('/users', formData.value)
      showNotification('Пользователь успешно создан', 'success')
    }
    closeModals()
    loadUsers()
  } catch (error) {
    showNotification('Ошибка: ' + (error.response?.data?.message || error.message), 'error')
  }
}

async function submitResetPassword() {
  try {
    await axiosInstance.post(`/users/${selectedUser.value._id}/reset-password`, {
      newPassword: newPassword.value
    })
    showNotification('Пароль успешно сброшен', 'success')
    closeModals()
  } catch (error) {
    showNotification('Ошибка: ' + (error.response?.data?.message || error.message), 'error')
  }
}

async function confirmDelete() {
  try {
    await axiosInstance.delete(`/users/${selectedUser.value._id}`)
    showNotification('Пользователь успешно удален', 'success')
    closeModals()
    loadUsers()
  } catch (error) {
    showNotification('Ошибка: ' + (error.response?.data?.message || error.message), 'error')
  }
}

function closeModals() {
  showCreateModal.value = false
  showEditModal.value = false
  showResetModal.value = false
  showDeleteModal.value = false
  selectedUser.value = null
  formData.value = { name: '', email: '', password: '', role: 'user' }
  newPassword.value = ''
}

function formatDate(dateString) {
  if (!dateString) return '—'
  const date = new Date(dateString)
  return date.toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

function showNotification(message, type) {
  notification.value = { message, type }
  setTimeout(() => {
    notification.value = null
  }, 3000)
}
</script>

<style scoped>
.user-management {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.header h1 {
  font-size: 1.8rem;
  color: #1a1a1a;
  margin: 0;
}

.users-table {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

table {
  width: 100%;
  border-collapse: collapse;
}

thead {
  background: #f8f9fa;
}

th {
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  color: #495057;
  border-bottom: 2px solid #dee2e6;
}

td {
  padding: 1rem;
  border-bottom: 1px solid #dee2e6;
}

tr:hover {
  background: #f8f9fa;
}

.role-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 500;
}

.role-admin {
  background: #e3f2fd;
  color: #1976d2;
}

.role-user {
  background: #f5f5f5;
  color: #757575;
}

.actions {
  display: flex;
  gap: 0.5rem;
}

button {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s;
}

.btn-primary {
  background: #2196f3;
  color: white;
}

.btn-primary:hover {
  background: #1976d2;
}

.btn-edit {
  background: #ff9800;
  color: white;
}

.btn-edit:hover {
  background: #f57c00;
}

.btn-reset {
  background: #9c27b0;
  color: white;
}

.btn-reset:hover {
  background: #7b1fa2;
}

.btn-delete {
  background: #f44336;
  color: white;
}

.btn-delete:hover {
  background: #d32f2f;
}

.btn-cancel {
  background: #e0e0e0;
  color: #424242;
}

.btn-cancel:hover {
  background: #bdbdbd;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  min-width: 400px;
  max-width: 500px;
}

.modal h2 {
  margin-top: 0;
  margin-bottom: 1.5rem;
  color: #1a1a1a;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #495057;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 1rem;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #2196f3;
}

.modal-actions {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
  margin-top: 1.5rem;
}

.warning {
  color: #f44336;
  font-weight: 500;
  margin: 1rem 0;
}

.notification {
  position: fixed;
  top: 2rem;
  right: 2rem;
  padding: 1rem 1.5rem;
  border-radius: 4px;
  color: white;
  font-weight: 500;
  z-index: 2000;
  animation: slideIn 0.3s ease-out;
}

.notification-success {
  background: #4caf50;
}

.notification-error {
  background: #f44336;
}

@keyframes slideIn {
  from {
    transform: translateX(400px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}
</style>