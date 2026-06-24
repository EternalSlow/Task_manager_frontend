<template>
  <div class="kanban-col" ref="columnRef">
    <div class="col-header">
      <div class="col-title">
        <div class="col-title-icon" :class="column.iconClass"></div>
        {{ column.title }}
        <span class="col-count" :class="column.iconClass">{{ column.count }}</span>
      </div>
      <div class="dot-menu" @click.stop="toggleMenu">⋮</div>
      <div v-if="showMenu" class="dropdown-menu" ref="menuRef">
        <div class="dropdown-item" @click="handleEdit">✏️ Edit</div>
        <div class="dropdown-item" @click="handleDelete">🗑️ Delete</div>
      </div>
    </div>
    <TaskCard
      v-for="(task, index) in column.tasks"
      :key="index"
      :task="task"
      @edit="(t) => $emit('edit-task', { columnId: column.id, task: t })"
      @delete="(t) => $emit('delete-task', { columnId: column.id, task: t })"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import TaskCard from './TaskCard.vue'

const props = defineProps({
  column: { type: Object, required: true }
})

const emit = defineEmits(['edit-column', 'delete-column', 'edit-task', 'delete-task'])

const showMenu = ref(false)
const menuRef = ref(null)

const toggleMenu = () => { showMenu.value = !showMenu.value }
const closeMenu = () => { showMenu.value = false }

const handleClickOutside = (event) => {
  if (menuRef.value && !menuRef.value.contains(event.target)) {
    const dotMenu = event.target.closest('.dot-menu')
    if (!dotMenu) closeMenu()
  }
}

onMounted(() => document.addEventListener('click', handleClickOutside))
onBeforeUnmount(() => document.removeEventListener('click', handleClickOutside))

const handleEdit = () => {
  closeMenu()
  emit('edit-column', props.column)
}
const handleDelete = () => {
  closeMenu()
  emit('delete-column', props.column)
}
</script>

<style scoped>
.kanban-col {
  position: relative;
}
.dot-menu {
  cursor: pointer;
  font-size: 18px;
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