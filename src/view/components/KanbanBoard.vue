<template>
  <div class="kanban-board">
    <KanbanColumn
      v-for="column in columns"
      :key="column.id"
      :column="column"
    />
  </div>
</template>

<script setup>
import KanbanColumn from './KanbanColumn.vue'

defineProps({
  columns: { type: Array, required: true },
})
</script>