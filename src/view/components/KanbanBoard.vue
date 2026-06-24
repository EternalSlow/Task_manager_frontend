<template>
  <div class="kanban-board">
    <KanbanColumn
      v-for="column in columns"
      :key="column.id"
      :column="column"
      @delete-task="(data) => $emit('delete-task', data)"
      @update-task="(t) => emit('update-task', t)"
     @edit-task="(payload) => emit('edit-task', payload)"
     @edit-column="(col) => emit('edit-column', col)"
     @delete-column="(col) => emit('delete-column', col)"
    />
  </div>
</template>

<script setup>
import KanbanColumn from './KanbanColumn.vue'

defineProps({
  columns: { type: Array, required: true },
})



defineEmits(['update-task','edit-column', 'delete-column', 'edit-task', 'delete-task'])
</script>