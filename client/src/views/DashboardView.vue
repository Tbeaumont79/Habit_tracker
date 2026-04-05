<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()

function handleLogout() {
  authStore.logout()
  router.push('/login')
}
</script>

<template>
  <div class="dashboard-page">
    <div class="dashboard-card">
      <h1 class="dashboard-title">Dashboard</h1>
      <p class="dashboard-subtitle">
        Welcome back{{ authStore.user?.name ? `, ${authStore.user.name}` : '' }}!
      </p>
      <p class="dashboard-note">Your habit dashboard is coming soon.</p>
      <button class="logout-btn" @click="handleLogout">Sign out</button>
    </div>
  </div>
</template>

<style scoped>
.dashboard-page {
  min-height: 100vh;
  background: var(--bg);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.dashboard-card {
  background: var(--surface);
  border-radius: 20px;
  border: 1px solid var(--border);
  box-shadow: 0 4px 24px rgba(45, 43, 61, 0.06);
  padding: 40px 36px;
  text-align: center;
  max-width: 440px;
  width: 100%;
}

.dashboard-title {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 28px;
  font-weight: 700;
  color: var(--text);
  margin-bottom: 8px;
}

.dashboard-subtitle {
  font-family: 'Inter', sans-serif;
  font-size: 16px;
  color: var(--text-secondary);
  margin-bottom: 8px;
}

.dashboard-note {
  font-family: 'Inter', sans-serif;
  font-size: 13px;
  color: var(--text-muted);
  margin-bottom: 24px;
}

.logout-btn {
  padding: 10px 20px;
  border-radius: 12px;
  border: 1.5px solid var(--border);
  background: transparent;
  color: var(--text-secondary);
  font-family: 'Inter', sans-serif;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.15s ease;
}

.logout-btn:hover {
  background: var(--surface-alt);
  color: var(--text);
}
</style>
