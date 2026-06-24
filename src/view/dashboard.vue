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
          @update-task="handleTaskUpdate"
        />
      </div>
    </main>

    <CreateTaskModal
      v-if="showTaskModal"
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
import { apiPost, apiGet } from '../api.js'
import { onMounted } from 'vue'

const showTaskModal = ref(false)

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

  try {

    const tasks = await apiGet('/api/kanban-tasks')

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

const handleEditTask = ({ columnId, task }) => {
  alert(`Edit task: ${task.title}`)
}

const closeTaskModal = () => {
  showTaskModal.value = false
}

const handleDeleteTask = ({ columnId, task }) => {
  if (confirm(`Delete task "${task.title}"?`)) {
    const col = columns.value.find(c => c.id === columnId)
    if (col) {
      const taskIndex = col.tasks.findIndex(t => t.title === task.title) // лучше использовать id
      if (taskIndex !== -1) {
        col.tasks.splice(taskIndex, 1)
        col.count--
      }
    }
  }
}

const handleTaskSubmit = async (taskData) => {
  try {
    const payload = {
      title: taskData.title,
      description: taskData.description || '',        // <-- это и есть “заметка”
      priority: taskData.priority.toLowerCase(),      // low/medium/high
      progress: 0,
      total: 5,
      dueDate: taskData.dueDate || '',
      status: 'not-started',
      assignees: taskData.assignees || [],
      comments: 0,
      attachments: 0,
    };

    const saved = await apiPost('/api/kanban-tasks', payload);

    columns.value[0].tasks.push(saved);
    columns.value[0].count++;

    showTaskModal.value = false;
  } catch (e) {
    console.error(e);
    alert('Не удалось сохранить задачу/заметку: ' + e.message);
  }
};

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