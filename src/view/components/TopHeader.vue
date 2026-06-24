<template>
  <header class="top-header">
    <div class="top-header-left">
      <div class="top-header-logo">C</div>
      <div class="top-header-title">Corp Task</div>
      <nav class="nav-tabs">
        <!-- <div
          v-for="tab in tabs"
          :key="tab"
          class="nav-tab"
          :class="{ active: tab === activeTab }"
          @click="activeTab = tab"
        >
          {{ tab }}
        </div> -->
      </nav>
    </div>
    <div class="top-header-right">
      <div class="header-icon">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"/>
          <path d="M21 21l-4.35-4.35"/>
        </svg>
      </div>
      <div class="header-icon has-badge">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"/>
        </svg>
      </div>
      <div class="header-avatar">SA</div>
    </div>
  </header>
</template>

<script setup>
import { ref } from 'vue'

const tabs = ['Overview', 'Activity', 'Manage', 'Program', 'Folders']
const activeTab = ref('Overview')
</script>