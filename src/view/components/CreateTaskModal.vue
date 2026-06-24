<template>
  <div class="modal-overlay" @click.self="close">
    <div class="modal-content">
      <!-- Шапка с крестиком -->
      <div class="modal-header">
        <h2 class="text-xl font-bold text-gray-900">{{ modalTitle }}</h2>
        <button class="close-btn" @click="close">✕</button>
      </div>

      <form @submit.prevent="handleSubmit" class="modal-body">
        <!-- Заголовок задачи -->
        <div class="form-group">
          <label class="form-label">Task Title *</label>
          <input
            v-model="form.title"
            type="text"
            class="form-input"
            placeholder="Enter task title"
            required
          />
        </div>

        <!-- Описание -->
        <div class="form-group">
          <label class="form-label">Description</label>
          <textarea
            v-model="form.description"
            class="form-input"
            rows="3"
            placeholder="Enter task description"
          ></textarea>
        </div>

        <!-- Категория (статус) -->
        <div class="form-group">
          <label class="form-label">Category *</label>
          <select v-model="form.category" class="form-input" required>
            <option value="" disabled>Select category</option>
            <option v-for="cat in categories" :key="cat" :value="cat">
              {{ cat }}
            </option>
          </select>
        </div>

        <!-- Приоритет -->
        <div class="form-group">
          <label class="form-label">Priority</label>
          <div class="priority-buttons">
            <button
              v-for="priority in priorities"
              :key="priority"
              type="button"
              :class="['priority-btn', priority, { active: form.priority === priority }]"
              @click="form.priority = priority"
            >
              {{ priority }}
            </button>
          </div>
        </div>

        <!-- Срок выполнения -->
        <div class="form-group">
          <label class="form-label">Due Date</label>
          <input
            v-model="form.dueDate"
            type="date"
            class="form-input"
          />
        </div>

        <!-- Назначенные пользователи -->
        <div class="form-group">
          <label class="form-label">Assignees</label>
          <div class="assignees-list">
            <div
              v-for="user in users"
              :key="user._id"
              :class="['assignee-item', { selected: form.assignees.includes(user._id) }]"
              @click="toggleAssignee(user._id)"
            >
              <div class="assignee-avatar">
                {{ (user.name || user.email).slice(0, 1).toUpperCase() }}
              </div>
              <span class="assignee-name">{{ user.name || user.email }}</span>
              <span v-if="form.assignees.includes(user._id)" class="check-mark">✓</span>
            </div>
          </div>
        </div>

        <!-- Кнопки действий -->
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="close">Cancel</button>
          <button type="submit" class="btn btn-primary">{{ submitLabel }}</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue'
import { apiGet } from '../../api.js'

const props = defineProps({
  task: { type: Object, default: null }, // ← новый проп
})

const emit = defineEmits(['close', 'submit'])

const categories = ['Not Started', 'In Progress', 'Under Review', 'Completed']
const priorities = ['low', 'medium', 'high']
const users = ref([])

const form = reactive({
  title: '',
  description: '',
  category: '',
  priority: 'medium',
  dueDate: '',
  assignees: [],
})

const isEditing = ref(false)

const modalTitle = computed(() => isEditing.value ? 'Edit Task' : 'Create New Task')
const submitLabel = computed(() => isEditing.value ? 'Save Changes' : 'Create Task')

onMounted(async () => {
  try {
    const response = await apiGet('/api/users')
    users.value = response.users || response || []
  } catch (err) {
    console.error('Failed to load users:', err)
  }
})

watch(
  () => props.task,
  (newTask) => {
    if (newTask) {
      isEditing.value = true
      form.title = newTask.title || ''
      form.description = newTask.description || ''
      form.priority = newTask.priority || 'medium'
      form.dueDate = newTask.dueDate
        ? newTask.dueDate.slice(0, 10) 
        : ''
      const statusToCategory = {
        'not-started': 'Not Started',
        'in-progress': 'In Progress',
        'under-review': 'Under Review',
        'completed': 'Completed',
      }
      form.category = statusToCategory[newTask.status] || 'Not Started'
      form.assignees = (newTask.assignees || []).map(
        u => (typeof u === 'object' ? u._id : u)
      )
    } else {
      isEditing.value = false
    }
  },
  { immediate: true }
)

function toggleAssignee(userId) {
  if (!userId) return
  
  const index = form.assignees.indexOf(userId)
  if (index === -1) {
    form.assignees.push(userId)
  } else {
    form.assignees.splice(index, 1)
  }
}

function close() {
  emit('close')
}

function handleSubmit() {
  if (!form.title.trim()) {
    alert('Please enter a task title')
    return
  }
  if (!form.category) {
    alert('Please select a category')
    return
  }

  emit('submit', {
    ...form,
    _id: props.task?._id,
    isEditing: isEditing.value,
  })
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  background: #ffffff;
  border-radius: 12px;
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e5e7eb;
}

.close-btn {
  background: none;
  border: none;
  color: #6b7280;
  font-size: 24px;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  transition: all 0.2s;
}

.close-btn:hover {
  background: #f3f4f6;
  color: #1f2937;
}

.modal-body {
  padding: 24px;
}

.form-group {
  margin-bottom: 20px;
}

.form-label {
  display: block;
  color: #374151;
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 8px;
}

.form-input {
  width: 100%;
  padding: 10px 12px;
  background: #ffffff;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  color: #1f2937;
  font-size: 14px;
  transition: all 0.2s;
}

.form-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-input::placeholder {
  color: #9ca3af;
}

textarea.form-input {
  resize: vertical;
  min-height: 80px;
}

select.form-input {
  cursor: pointer;
}

.priority-buttons {
  display: flex;
  gap: 8px;
}

.priority-btn {
  flex: 1;
  padding: 10px;
  border: 1px solid #d1d5db;
  background: #ffffff;
  color: #6b7280;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  text-transform: capitalize;
  transition: all 0.2s;
}

.priority-btn:hover {
  border-color: #9ca3af;
  background: #f9fafb;
}

.priority-btn.active {
  border-width: 2px;
}

.priority-btn.low.active {
  border-color: #10b981;
  background: #ecfdf5;
  color: #059669;
}

.priority-btn.medium.active {
  border-color: #f59e0b;
  background: #fffbeb;
  color: #d97706;
}

.priority-btn.high.active {
  border-color: #ef4444;
  background: #fef2f2;
  color: #dc2626;
}

.assignees-list {
  max-height: 200px;
  overflow-y: auto;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #ffffff;
}

.assignee-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  cursor: pointer;
  transition: background 0.2s;
}

.assignee-item:hover {
  background: #f9fafb;
}

.assignee-item.selected {
  background: #eff6ff;
}

.assignee-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #3b82f6;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
}

.assignee-name {
  flex: 1;
  color: #374151;
  font-size: 14px;
}

.check-mark {
  color: #10b981;
  font-size: 18px;
  font-weight: bold;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid #e5e7eb;
}

.btn {
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.btn-secondary {
  background: #f3f4f6;
  color: #374151;
}

.btn-secondary:hover {
  background: #e5e7eb;
}

.btn-primary {
  background: #3b82f6;
  color: #fff;
}

.btn-primary:hover {
  background: #2563eb;
}
</style>