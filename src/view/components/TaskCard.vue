<template>
  <div class="task-card bg-gray-800 rounded-xl p-4 mb-3 cursor-pointer">
    <!-- Шапка карточки: заголовок + троеточие -->
    <div class="task-card-header">
      <h3 class="text-white font-semibold text-sm">{{ task.title }}</h3>
      <div class="dot-menu" @click.stop="toggleMenu">⋮</div>
      <div v-if="showMenu" class="dropdown-menu" ref="menuRef">
        <div class="dropdown-item" @click="handleEdit">✏️ Edit</div>
        <div class="dropdown-item" @click="handleDelete">🗑️ Delete</div>
      </div>
    </div>

    <!-- Описание (редактируемое) -->
    <div class="mt-2">
      <div v-if="!isEditingDescription" class="group">
        <p
          class="text-gray-400 text-xs min-h-[20px] cursor-pointer
                 hover:bg-gray-700 rounded px-1 py-0.5 transition"
          @click="startEditingDescription"
        >
          {{ task.description || 'Нажмите, чтобы добавить заметку...' }}
        </p>
      </div>
      <div v-else>
        <textarea
          ref="descriptionTextarea"
          v-model="editedDescription"
          class="w-full bg-gray-700 text-white text-xs rounded p-2
                 border border-gray-600 focus:border-blue-500
                 focus:outline-none resize-none"
          rows="3"
          placeholder="Введите заметку..."
          @keydown.enter.ctrl="saveDescription"
          @keydown.escape="cancelEditingDescription"
        />
        <div class="flex gap-2 mt-1">
          <button
            class="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition"
            :disabled="isSaving"
            @click="saveDescription"
          >
            {{ isSaving ? 'Сохранение...' : 'Сохранить' }}
          </button>
          <button
            class="px-3 py-1 bg-gray-600 text-white text-xs rounded hover:bg-gray-500 transition"
            @click="cancelEditingDescription"
          >
            Отмена
          </button>
        </div>
        <p v-if="saveError" class="text-red-400 text-xs mt-1">{{ saveError }}</p>
      </div>
    </div>

    <!-- Прогресс, срок, футер — без изменений -->
    <div class="task-progress">
      <span class="task-progress-label">Progress</span>
      <div class="progress-bar">
        <div
          class="progress-fill"
          :class="task.priority"
          :style="{ width: `${(task.progress / task.total) * 100}%` }"
        ></div>
      </div>
      <span class="progress-text">{{ task.progress }}/{{ task.total }}</span>
    </div>
    <div class="task-due">📅 Due to: {{ task.dueDate }}</div>
    <div class="task-footer">
      <div class="avatars">
        <div
          v-for="u in (task.assignees || [])"
          :key="u._id"
          class="avatar"
          :title="u.name || u.email"
        >
          {{ (u.name || u.email).slice(0, 1).toUpperCase() }}
        </div>
        <div
          v-if="(!task.assignees || task.assignees.length === 0) && task.avatars?.length"
          v-for="(color, i) in task.avatars"
          :key="'legacy-'+i"
          class="avatar"
          :style="{ background: color }"
        ></div>
      </div>
      <div class="task-stats">
        <span>✎ {{ task.attachments }}</span>
        <span>💬 {{ task.comments }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick, onMounted, onBeforeUnmount } from 'vue'
import { apiPut } from '../../api.js'
import { defineEmits } from 'vue'

const props = defineProps({
  task: { type: Object, required: true },
})

const emit = defineEmits(['update-task', 'edit', 'delete'])

// === Меню троеточия ===
const showMenu = ref(false)
const menuRef = ref(null)

const toggleMenu = () => { showMenu.value = !showMenu.value }
const closeMenu  = () => { showMenu.value = false }

const handleClickOutside = (event) => {
  if (menuRef.value && !menuRef.value.contains(event.target)) {
    const dot = event.target.closest('.dot-menu')
    if (!dot) closeMenu()
  }
}

onMounted(() => document.addEventListener('click', handleClickOutside))
onBeforeUnmount(() => document.removeEventListener('click', handleClickOutside))

const handleEdit = () => {
  closeMenu()
  emit('edit', props.task)
}
const handleDelete = () => {
  closeMenu()
  emit('delete', props.task)
}

// === Редактирование описания (без изменений) ===
const isEditingDescription = ref(false)
const editedDescription = ref('')
const isSaving = ref(false)
const saveError = ref('')
const descriptionTextarea = ref(null)

function startEditingDescription() {
  editedDescription.value = props.task.description || ''
  isEditingDescription.value = true
  saveError.value = ''
  nextTick(() => descriptionTextarea.value?.focus())
}
function cancelEditingDescription() {
  isEditingDescription.value = false
  editedDescription.value = ''
  saveError.value = ''
}
async function saveDescription() {
  if (editedDescription.value === (props.task.description || '')) {
    cancelEditingDescription()
    return
  }
  isSaving.value = true
  saveError.value = ''
  try {
    const updated = await apiPut(`/api/kanban-tasks/${props.task._id}`, {
      description: editedDescription.value,
    })
    emit('update-task', updated)
    isEditingDescription.value = false
  } catch (err) {
    console.error('Save failed:', err)
    saveError.value = 'Не удалось сохранить: ' + err.message
  } finally {
    isSaving.value = false
  }
}
</script>

<style scoped>
.task-card { position: relative; }

.task-card-header {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.dot-menu {
  cursor: pointer;
  font-size: 18px;
  line-height: 1;
  user-select: none;
  padding: 0 4px;
  color: #9ca3af;
}
.dot-menu:hover { color: #fff; }

.dropdown-menu {
  position: absolute;
  right: 0;
  top: 100%;
  background: #1f2937;
  border: 1px solid #374151;
  border-radius: 8px;
  min-width: 140px;
  z-index: 100;
  padding: 6px 0;
  margin-top: 4px;
  box-shadow: 0 10px 15px -3px rgba(0,0,0,0.3);
}
.dropdown-item {
  padding: 8px 16px;
  font-size: 13px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  color: #e5e7eb;
  transition: background 0.1s;
}
.dropdown-item:hover { background: #374151; }
</style>