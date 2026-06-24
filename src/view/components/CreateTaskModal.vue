<template>
  <div class="modal-overlay" @click="closeModal">
    <div class="modal-container" @click.stop>
      <div class="modal-header">
        <div>
          <h2 class="modal-title">Create New Task</h2>
          <p class="modal-subtitle">Fill out the details below to add a new task to your board.</p>
        </div>
        <button class="modal-close" @click="closeModal">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      <div class="modal-body">
        <div class="form-section">
          <h3 class="section-title">
            <span class="section-icon bg-orange">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10 9 9 9 8 9"></polyline>
              </svg>
            </span>
            General Information
          </h3>
          
          <div class="form-group">
            <label class="form-label">Task Title</label>
            <input 
              type="text" 
              class="form-input" 
              placeholder="e.g., Redesign Landing Page" 
              v-model="form.title" 
            />
          </div>
          
          <div class="form-group">
            <label class="form-label">Description</label>
            <textarea 
              class="form-input textarea" 
              placeholder="Provide details about this task..." 
              v-model="form.description"
            ></textarea>
          </div>
        </div>

        <div class="form-section">
          <h3 class="section-title">
            <span class="section-icon bg-blue">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="3"></circle>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
              </svg>
            </span>
            Task Properties
          </h3>
          
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Category</label>
              <select class="form-input" v-model="form.category">
                <option 
                  v-for="col in columns" 
                  :key="col.id" 
                  :value="col.title"
                >
                  {{ col.title }}
                </option>
              </select>
            </div>
            
            <div class="form-group">
              <label class="form-label">Priority</label>
              <div class="priority-group">
                <button 
                  v-for="priority in priorities" 
                  :key="priority" 
                  :class="['priority-btn', { active: form.priority === priority }]" 
                  @click="form.priority = priority"
                >
                  {{ priority }}
                </button>
              </div>
            </div>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Due Date</label>
              <input 
                type="date" 
                class="form-input" 
                v-model="form.dueDate" 
              />
            </div>
            
            <div class="form-group">
              <label class="form-label">Assignees</label>

              <div v-if="isUsersLoading">Loading users...</div>

              <div v-else class="assignees-list">
                <label v-for="u in users" :key="u._id" class="assignee-row">
                  <input
                    type="checkbox"
                    :checked="form.assignees.includes(u._id)"
                    @change="toggleAssignee(u._id)"
                  />
                  <span>{{ u.name || u.email }}</span>
                  <small v-if="u.role === 'admin'">(admin)</small>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button class="btn-cancel" @click="closeModal">Cancel</button>
        <button class="btn-submit" @click="handleSubmit">Create Task</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue'
import { apiGet } from '../../api.js'

const emit = defineEmits(['close', 'submit'])

const users = ref([])
const isUsersLoading = ref(false)

const form = reactive({
  title: '',
  description: '',
  priority: 'Medium',
  dueDate: '',
  assignees: [],
})

onMounted(async () => {
  isUsersLoading.value = true
  try {
    users.value = await apiGet('/api/users')
  } finally {
    isUsersLoading.value = false
  }
})

function toggleAssignee(userId) {
  const i = form.assignees.indexOf(userId)
  if (i === -1) form.assignees.push(userId)
  else form.assignees.splice(i, 1)
}

const handleSubmit = () => {
  emit('submit', { ...form })
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal-container {
  background: white;
  border-radius: 12px;
  width: 100%;
  max-width: 640px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from { 
    opacity: 0;
    transform: translateY(20px);
  }
  to { 
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-header {
  padding: 32px 32px 24px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.modal-title {
  font-size: 24px;
  font-weight: 700;
  color: #111827;
  margin-bottom: 8px;
}

.modal-subtitle {
  font-size: 14px;
  color: #6b7280;
}

.modal-close {
  width: 36px;
  height: 36px;
  border: none;
  background: #f3f4f6;
  border-radius: 8px;
  color: #6b7280;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.modal-close:hover {
  background: #e5e7eb;
  color: #111827;
}

.modal-body {
  padding: 0 32px 32px;
}

.form-section {
  margin-bottom: 32px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #111827;
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
}

.section-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.bg-orange {
  background-color: #fff7ed;
  color: #ff6b00;
}

.bg-blue {
  background-color: #eff6ff;
  color: #3b82f6;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 20px;
}

.form-label {
  font-size: 13px;
  font-weight: 600;
  color: #374151;
}

.form-input {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  color: #111827;
  background-color: #f9fafb;
  transition: all 0.2s ease;
  font-family: inherit;
}

.form-input:focus {
  outline: none;
  border-color: #ff6b00;
  background-color: white;
  box-shadow: 0 0 0 3px rgba(255, 107, 0, 0.1);
}

.textarea {
  resize: vertical;
  min-height: 100px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.priority-group {
  display: flex;
  background-color: #f3f4f6;
  border-radius: 8px;
  padding: 4px;
}

.priority-btn {
  flex: 1;
  padding: 8px 0;
  border: none;
  background: transparent;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s ease;
}

.priority-btn.active {
  background-color: white;
  color: #ff6b00;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  font-weight: 600;
}

.assignees-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 2px solid white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.add-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 1px dashed #d1d5db;
  background: #f9fafb;
  color: #9ca3af;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.add-avatar:hover {
  border-color: #ff6b00;
  color: #ff6b00;
  background-color: #fff7ed;
}

.modal-footer {
  padding: 24px 32px 32px;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  border-top: 1px solid #f3f4f6;
}

.btn-cancel {
  padding: 12px 24px;
  background: transparent;
  color: #6b7280;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-cancel:hover {
  background-color: #f3f4f6;
  color: #111827;
}

.btn-submit {
  padding: 12px 28px;
  background-color: #111827;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-submit:hover {
  background-color: #1f2937;
  transform: translateY(-1px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

@media (max-width: 640px) {
  .modal-header,
  .modal-body,
  .modal-footer {
    padding-left: 24px;
    padding-right: 24px;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>