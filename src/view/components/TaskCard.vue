<template>
  <div class="task-card bg-gray-800 rounded-xl p-4 mb-3 cursor-pointer">

    <h3 class="text-white font-semibold text-sm">{{ task.title }}</h3>

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
            class="px-3 py-1 bg-blue-600 text-white text-xs rounded
                   hover:bg-blue-700 transition"
            :disabled="isSaving"
            @click="saveDescription"
          >
            {{ isSaving ? 'Сохранение...' : 'Сохранить' }}
          </button>
          <button
            class="px-3 py-1 bg-gray-600 text-white text-xs rounded
                   hover:bg-gray-500 transition"
            @click="cancelEditingDescription"
          >
            Отмена
          </button>
        </div>
        <p v-if="saveError" class="text-red-400 text-xs mt-1">{{ saveError }}</p>
      </div>
    </div>

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

        <!-- fallback для старых задач, если остались task.avatars -->
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
import { ref, nextTick } from 'vue'
import { apiPut } from '../../api.js'

const props = defineProps({
  task: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['update'])

const isEditingDescription = ref(false)
const editedDescription = ref('')
const isSaving = ref(false)
const saveError = ref('')
const descriptionTextarea = ref(null)

function startEditingDescription() {
  editedDescription.value = props.task.description || ''
  isEditingDescription.value = true
  saveError.value = ''

  nextTick(() => {
    descriptionTextarea.value?.focus()
  })
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

    emit('update', updated)
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
.task-card {
  position: relative;
}

.dot-menu {
  cursor: pointer;
  font-size: 18px;
  line-height: 1;
  user-select: none;
  padding: 0 4px;
}

.dropdown-menu {
  position: absolute;
  right: 0;
  top: 100%;
  background: white;
  border-radius: 8px;
  box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05);
  min-width: 140px;
  z-index: 100;
  padding: 6px 0;
  margin-top: 4px;
}

.dropdown-item {
  padding: 8px 16px;
  font-size: 13px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  color: #374151;
  transition: background 0.1s;
}

.dropdown-item:hover {
  background: #f3f4f6;
}
</style>