<template>
  <div v-if="isLoading" class="flex items-center justify-center h-64">
    <span class="text-gray-400 text-lg">Загрузка...</span>
  </div>

  <div v-else-if="loadError" class="flex items-center justify-center h-64">
    <span class="text-red-400 text-lg">Ошибка загрузки: {{ loadError }}</span>
  </div>

  <div v-else class="app">
    <Sidebar @open-tasks="showTaskModal = true" />
    <main class="main">
      <TopHeader />
      <div class="content">
        <FoldersGrid :folders="folders" @add-folder="handleAddFolder" />
        <ViewControls @create-task="showTaskModal = true" />
          <KanbanBoard
            :columns="columns"
            @edit-column="handleEditColumn"
            @delete-column="handleDeleteColumn"
            @edit-task="handleEditTask"
            @delete-task="handleDeleteTask"
          /> 
      </div>
    </main>

    <CreateTaskModal
      v-if="showTaskModal"
      :task="editingTask"
      @close="showTaskModal = false"
      @submit="handleTaskSubmit"
      :columns="columns"
    />

  </div>
</template>

<script setup>
import { ref } from 'vue'
import Sidebar from './components/Sidebar.vue'
import TopHeader from './components/TopHeader.vue'
import ViewControls from './components/ViewControls.vue'
import KanbanBoard from './components/KanbanBoard.vue'
import CreateTaskModal from './components/CreateTaskModal.vue'
import { apiGet, apiPost, apiPut, apiDelete } from '../api.js'
import { onMounted } from 'vue'

const showTaskModal = ref(false)
const currentUser = ref(null)
const editingTask = ref(null)

function openCreateModal() {
  editingTask.value = null
  showTaskModal.value = true
}

function handleEditTask({ columnId, task }) {
  editingTask.value = task
  showTaskModal.value = true
}


const columns = ref([
  {
    id: 'not-started',
    title: 'Not Started',
    count: 0,
    dotColor: 'bg-red-500',
    tasks: [],
  },
  {
    id: 'in-progress',
    title: 'In Progress',
    count: 0,
    dotColor: 'bg-yellow-500',
    tasks: [],
  },
  {
    id: 'under-review',
    title: 'Under Review',
    count: 0,
    dotColor: 'bg-blue-500',
    tasks: [],
  },
  {
    id: 'completed',
    title: 'Completed',
    count: 0,
    dotColor: 'bg-green-500',
    tasks: [],
  },
])

const isLoading = ref(false)
const loadError = ref('')

onMounted(async () => {
  isLoading.value = true
  loadError.value = ''
  const profile = await apiGet('/api/profile')
  currentUser.value = profile.user

  try {

    const tasks = await apiGet(`/api/kanban-tasks?assigneeId=${profile.user.id}`)

    for (const col of columns.value) {
      col.tasks = tasks.filter((t) => t.status === col.id)
      col.count = col.tasks.length
    }
  } catch (err) {
    console.error('Failed to load data:', err)
    loadError.value = err.message
  } finally {
    isLoading.value = false
  }
})

const handleEditColumn = (column) => {
  alert(`Edit column: ${column.title}`)
}

const handleDeleteColumn = (column) => {
  if (confirm(`Delete column "${column.title}"?`)) {
    const index = columns.value.findIndex(c => c.id === column.id)
    if (index !== -1) columns.value.splice(index, 1)
  }
}

const handleCreateTask = () => {
  showTaskModal.value = true
}

const closeTaskModal = () => {
  showTaskModal.value = false
}

const handleDeleteTask = async ({ columnId, task }) => {
  if (!confirm(`Delete task "${task.title}"?`)) return

  if (task._id) {
    try {
      await apiDelete(`/api/kanban-tasks/${task._id}`)
    } catch (err) {
      alert('Ошибка удаления: ' + err.message)
      return
    }
  }

  const col = columns.value.find(c => c.id === columnId)
  if (col) {
    const taskIndex = col.tasks.findIndex(t => t._id === task._id)
    if (taskIndex !== -1) {
      col.tasks.splice(taskIndex, 1)
      col.count--
    }
  }
}

async function handleTaskSubmit(taskData) {
  try {
    const statusMap = {
      'Not Started': 'not-started',
      'In Progress': 'in-progress',
      'Under Review': 'under-review',
      'Completed': 'completed',
    }

    const payload = {
      title: taskData.title,
      description: taskData.description,
      priority: taskData.priority.toLowerCase(),
      dueDate: taskData.dueDate,
      status: statusMap[taskData.category] || 'not-started',
      assignees: (taskData.assignees || []).filter(Boolean),
    }

    let savedTask

    if (taskData.isEditing && taskData._id) {
      savedTask = await apiPut(`/api/kanban-tasks/${taskData._id}`, payload)

      for (const col of columns.value) {
        const idx = col.tasks.findIndex(t => t._id === taskData._id)
        if (idx !== -1) {
          col.tasks.splice(idx, 1)
          col.count--
        }
      }
    } else {
      savedTask = await apiPost('/api/kanban-tasks', payload)
    }

    const targetCol = columns.value.find(c => c.id === savedTask.status)
    if (targetCol) {
      targetCol.tasks.push(savedTask)
      targetCol.count++
    }

    showTaskModal.value = false
    editingTask.value = null
  } catch (err) {
    alert('Ошибка: ' + err.message)
  }
}

function handleTaskUpdate(updatedTask) {
  for (const col of columns.value) {
    const index = col.tasks.findIndex((t) => t._id === updatedTask._id)
    if (index !== -1) {
      col.tasks[index] = { ...col.tasks[index], ...updatedTask }
      break
    }
  }
}
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&display=swap');
@import './style.css';
</style>