<template>
  <div class="folders-grid">
    <div class="add-folder-card" @click="$emit('add-folder')">
      <div class="folder-icon add">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="12" y1="5" x2="12" y2="19"/>
          <line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
      </div>
      <div class="folder-info">
        <div class="folder-count">Add New Folder</div>
      </div>
    </div>
    <FolderCard
      v-for="(folder, index) in folders"
      :key="index"
      :count="folder.count"
      :name="folder.name"
    />
  </div>
</template>

<script setup>
import FolderCard from './FolderCard.vue'

defineProps({
  folders: { type: Array, required: true },
})

defineEmits(['add-folder'])
</script>