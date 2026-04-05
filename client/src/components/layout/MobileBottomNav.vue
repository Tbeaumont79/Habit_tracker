<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { Home, BookOpen, CheckSquare, Settings } from 'lucide-vue-next'

const route = useRoute()

interface NavItem {
  label: string
  to: string
  icon: typeof Home
}

const navItems: NavItem[] = [
  { label: 'Home', to: '/dashboard', icon: Home },
  { label: 'Habits', to: '/habits', icon: BookOpen },
  { label: 'Today', to: '/today', icon: CheckSquare },
  { label: 'Settings', to: '/settings', icon: Settings },
]

function isActive(to: string): boolean {
  return route.path === to || route.path.startsWith(to + '/')
}

const activeColor = computed(() => 'var(--primary)')
</script>

<template>
  <nav class="mobile-bottom-nav" aria-label="Mobile navigation">
    <RouterLink
      v-for="item in navItems"
      :key="item.to"
      :to="item.to"
      class="nav-item"
      :class="{ 'nav-item--active': isActive(item.to) }"
      :aria-current="isActive(item.to) ? 'page' : undefined"
    >
      <component :is="item.icon" :size="22" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="nav-icon" />
      <span class="nav-label">{{ item.label }}</span>
    </RouterLink>
  </nav>
</template>

<style scoped>
.mobile-bottom-nav {
  display: none;
}

@media (max-width: 767px) {
  .mobile-bottom-nav {
    display: flex;
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    height: 64px;
    background: var(--surface);
    border-top: 1px solid var(--border);
    z-index: 100;
    align-items: stretch;
  }
}

.nav-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3px;
  min-height: 44px;
  min-width: 44px;
  text-decoration: none;
  color: var(--text-muted);
  transition: color 0.15s ease;
  cursor: pointer;
}

.nav-item--active,
.nav-item--active .nav-icon {
  color: v-bind(activeColor);
}

.nav-icon {
  flex-shrink: 0;
  color: inherit;
}

.nav-label {
  font-size: 10px;
  font-weight: 500;
  line-height: 1;
  color: inherit;
  font-family: 'Inter', sans-serif;
}
</style>
