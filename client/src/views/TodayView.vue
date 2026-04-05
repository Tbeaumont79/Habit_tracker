<script setup lang="ts">
import AppShell from '@/components/layout/AppShell.vue'
import TodayChecklist from '@/components/tracking/TodayChecklist.vue'
</script>

<template>
  <AppShell>
    <div class="today-container">
      <TodayChecklist />
    </div>
  </AppShell>
</template>

<style scoped>
.today-container {
  max-width: 600px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 24px;
}
</style>
