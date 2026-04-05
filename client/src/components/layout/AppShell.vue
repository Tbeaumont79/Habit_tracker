<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const greeting = computed(() => {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
})

const formattedDate = computed(() =>
  new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }),
)

const userName = computed(() => authStore.user?.name ?? '')

const navItems = [
  { name: 'Dashboard', to: '/dashboard', icon: 'home' },
  { name: 'Habits', to: '/habits', icon: 'check-circle' },
  { name: 'Today', to: '/today', icon: 'bar-chart' },
  { name: 'Settings', to: '/settings', icon: 'settings' },
]

function isActive(path: string): boolean {
  return route.path === path
}

function handleNewHabit() {
  router.push('/habits')
}
</script>

<template>
  <div class="app-shell">
    <!-- Sidebar -->
    <aside class="sidebar">
      <div class="sidebar__logo">
        <span class="sidebar__logo-h">H</span>abitTracker
      </div>

      <nav class="sidebar__nav" aria-label="Main navigation">
        <RouterLink
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          class="sidebar__nav-item"
          :class="{ 'sidebar__nav-item--active': isActive(item.to) }"
        >
          <!-- Home icon -->
          <svg
            v-if="item.icon === 'home'"
            class="sidebar__nav-icon"
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>

          <!-- Check-circle icon -->
          <svg
            v-else-if="item.icon === 'check-circle'"
            class="sidebar__nav-icon"
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>

          <!-- Bar-chart icon (Today) -->
          <svg
            v-else-if="item.icon === 'bar-chart'"
            class="sidebar__nav-icon"
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <line x1="18" y1="20" x2="18" y2="10" />
            <line x1="12" y1="20" x2="12" y2="4" />
            <line x1="6" y1="20" x2="6" y2="14" />
          </svg>

          <!-- Settings icon -->
          <svg
            v-else-if="item.icon === 'settings'"
            class="sidebar__nav-icon"
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>

          <span class="sidebar__nav-label">{{ item.name }}</span>
        </RouterLink>
      </nav>
    </aside>

    <!-- Main content -->
    <main class="main">
      <!-- Page header -->
      <header class="main__header">
        <div class="main__header-text">
          <h1 class="main__greeting">{{ greeting }}<span v-if="userName">, {{ userName }}</span></h1>
          <p class="main__date">{{ formattedDate }}</p>
        </div>
        <button class="main__new-habit-btn" @click="handleNewHabit">
          <span aria-hidden="true">+</span> New Habit
        </button>
      </header>

      <!-- Slot for page content -->
      <div class="main__content">
        <slot />
      </div>
    </main>
  </div>
</template>

<style scoped>
.app-shell {
  display: flex;
  min-height: 100vh;
  background: var(--bg);
}

/* ── Sidebar ─────────────────────────────────────────── */
.sidebar {
  display: none;
  width: 240px;
  min-width: 240px;
  background: var(--surface);
  border-right: 1px solid var(--border);
  flex-direction: column;
  gap: 32px;
  padding: 32px 16px;
  position: sticky;
  top: 0;
  height: 100vh;
  overflow-y: auto;
}

@media (min-width: 768px) {
  .sidebar {
    display: flex;
  }
}

.sidebar__logo {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 18px;
  font-weight: 700;
  color: var(--text);
  padding: 0 8px;
  letter-spacing: -0.01em;
}

.sidebar__logo-h {
  color: var(--primary);
}

.sidebar__nav {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.sidebar__nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 12px;
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  font-weight: 500;
  color: var(--text-secondary);
  text-decoration: none;
  transition: background 0.12s, color 0.12s;
}

.sidebar__nav-item:hover {
  background: var(--surface-alt);
  color: var(--text);
}

.sidebar__nav-item--active {
  background: var(--surface-alt);
  color: var(--primary);
}

.sidebar__nav-icon {
  flex-shrink: 0;
  opacity: 0.7;
}

.sidebar__nav-item--active .sidebar__nav-icon,
.sidebar__nav-item:hover .sidebar__nav-icon {
  opacity: 1;
}

.sidebar__nav-label {
  flex: 1;
}

/* ── Main content ────────────────────────────────────── */
.main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  padding: 48px 32px;
  gap: 32px;
}

@media (max-width: 767px) {
  .main {
    padding: 24px 16px;
  }
}

.main__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}

.main__greeting {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 24px;
  font-weight: 700;
  color: var(--text);
  line-height: 1.2;
}

.main__date {
  font-size: 14px;
  color: var(--text-muted);
  margin-top: 4px;
}

.main__new-habit-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 20px;
  border-radius: 12px;
  border: none;
  background: var(--primary);
  color: white;
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.12s, transform 0.1s;
  white-space: nowrap;
}

.main__new-habit-btn:hover {
  background: var(--primary-dark);
}

.main__new-habit-btn:active {
  transform: scale(0.97);
}

.main__content {
  flex: 1;
}
</style>
