<template>
  <div class="folder-card" ref="folderRef">
    <div class="folder-icon">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/>
      </svg>
    </div>
    <div class="folder-info">
      <div class="folder-count">{{ count }} Files</div>
      <div class="folder-name">{{ name }}</div>
    </div>
    <div class="dot-menu" @click.stop="toggleMenu">⋮</div>
    <!-- Выпадающее меню -->
    <div v-if="showMenu" class="dropdown-menu" ref="menuRef">
      <div class="dropdown-item" @click="handleEdit">✏️ Edit</div>
      <div class="dropdown-item" @click="handleDelete">🗑️ Delete</div>
    </div>
  </div>
</template>


<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps({
  count: { type: Number, required: true },
  name: { type: String, required: true },
  // Можно передать id папки, если есть
})

const emit = defineEmits(['edit-folder', 'delete-folder'])

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
  emit('edit-folder', { name: props.name, count: props.count })
}
const handleDelete = () => {
  closeMenu()
  emit('delete-folder', { name: props.name })
}
</script>
<style scoped>
.folder-card {
  position: relative;
}
.dot-menu {
  cursor: pointer;
  font-size: 18px;
  user-select: none;
  padding: 0 4px;
}
.dropdown-menu {
  /* те же стили */
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