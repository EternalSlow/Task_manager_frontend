<template>
  <div class="kanban-board">
    <KanbanColumn
      v-for="column in columns"
      :key="column.id"
      :column="column"
      @edit-column="(col) => $emit('edit-column', col)"
      @delete-column="(col) => $emit('delete-column', col)"
      @edit-task="(data) => $emit('edit-task', data)"
      @delete-task="(data) => $emit('delete-task', data)"
    />
  </div>
</template>

<script setup>
import KanbanColumn from './KanbanColumn.vue'

defineProps({
  columns: { type: Array, required: true },
})

defineEmits(['edit-column', 'delete-column', 'edit-task', 'delete-task'])
</script>