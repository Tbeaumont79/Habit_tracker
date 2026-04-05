<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import AppShell from '@/components/layout/AppShell.vue'
import BentoGrid from '@/components/dashboard/BentoGrid.vue'
import BentoCard from '@/components/dashboard/BentoCard.vue'
import TodayChecklist from '@/components/tracking/TodayChecklist.vue'
import CompletionCircle from '@/components/dashboard/CompletionCircle.vue'
import StreakCard from '@/components/dashboard/StreakCard.vue'
import WeeklyHeatmap from '@/components/dashboard/WeeklyHeatmap.vue'
import CategoryDonut from '@/components/dashboard/CategoryDonut.vue'
import KpiCard from '@/components/dashboard/KpiCard.vue'
import { useStatsStore } from '@/stores/stats'
import { useHabitsStore } from '@/stores/habits'
import { useTrackingStore } from '@/stores/tracking'

const statsStore = useStatsStore()
const habitsStore = useHabitsStore()
const trackingStore = useTrackingStore()

const isLoading = ref(true)
const mounted = ref(false)

const todayRate = computed(() => statsStore.stats?.today.rate ?? 0)

const bestStreak = computed(() => statsStore.stats?.streaks.best)

const weeklyHeatmap = computed(() => statsStore.stats?.weeklyHeatmap ?? [])

const categoryData = computed(() => statsStore.stats?.categoryBreakdown ?? [])

const activeHabitsCount = computed(() => statsStore.stats?.activeHabits ?? 0)

const thisMonthCompletions = computed(() => statsStore.stats?.thisMonth.completions ?? 0)

const thisMonthTrend = computed(() => {
  const s = statsStore.stats
  if (!s) return undefined
  const diff = s.thisMonth.completions - s.thisMonth.previousMonth
  if (diff === 0) return undefined
  return diff > 0 ? `+${diff} vs last month` : `${diff} vs last month`
})

onMounted(async () => {
  try {
    await Promise.all([
      statsStore.fetchStats(),
      habitsStore.fetchHabits(),
      trackingStore.fetchTodayLogs(),
    ])
  } catch {
    // silently handle — child components show empty states
  } finally {
    isLoading.value = false
    // trigger stagger animation
    requestAnimationFrame(() => {
      mounted.value = true
    })
  }
})
</script>

<template>
  <AppShell>
    <BentoGrid>
      <!-- Today's Habits — large (2 col + 2 row) -->
      <BentoCard size="large" title="Today's Habits" icon="✅">
        <div v-if="isLoading" class="skeleton skeleton--list" />
        <TodayChecklist v-else />
      </BentoCard>

      <!-- Today completion — small -->
      <BentoCard size="small" title="Today" icon="🎯">
        <div v-if="isLoading" class="skeleton skeleton--circle" />
        <div v-else class="card-center">
          <CompletionCircle :percentage="todayRate" />
        </div>
      </BentoCard>

      <!-- Best Streak — small -->
      <BentoCard size="small" title="Best Streak" icon="🔥">
        <div v-if="isLoading" class="skeleton skeleton--text" />
        <StreakCard
          v-else-if="bestStreak"
          :count="bestStreak.count"
          :habit-name="bestStreak.habitName"
        />
        <div v-else class="empty-state">No streak data yet</div>
      </BentoCard>

      <!-- Weekly Overview — medium (2 col) -->
      <BentoCard size="medium" title="Weekly Overview" icon="📅">
        <div v-if="isLoading" class="skeleton skeleton--heatmap" />
        <WeeklyHeatmap v-else-if="weeklyHeatmap.length > 0" :data="weeklyHeatmap" />
        <div v-else class="empty-state">No weekly data yet</div>
      </BentoCard>

      <!-- Categories — medium (2 col) -->
      <BentoCard size="medium" title="Categories" icon="🍩">
        <div v-if="isLoading" class="skeleton skeleton--donut" />
        <CategoryDonut v-else-if="categoryData.length > 0" :data="categoryData" />
        <div v-else class="empty-state">No category data yet</div>
      </BentoCard>

      <!-- Active Habits — small -->
      <BentoCard size="small" title="Active Habits" icon="⚡">
        <div v-if="isLoading" class="skeleton skeleton--kpi" />
        <KpiCard v-else :value="activeHabitsCount" label="Active habits" />
      </BentoCard>

      <!-- This Month — small -->
      <BentoCard size="small" title="This Month" icon="📆">
        <div v-if="isLoading" class="skeleton skeleton--kpi" />
        <KpiCard
          v-else
          :value="thisMonthCompletions"
          label="Completions"
          :trend="thisMonthTrend"
        />
      </BentoCard>
    </BentoGrid>
  </AppShell>
</template>

<style scoped>
/* Skeleton loaders */
.skeleton {
  border-radius: 12px;
  background: linear-gradient(
    90deg,
    var(--border) 25%,
    var(--surface-alt) 50%,
    var(--border) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

.skeleton--list {
  height: 240px;
  width: 100%;
}

.skeleton--circle {
  width: 140px;
  height: 140px;
  border-radius: 50%;
  margin: auto;
}

.skeleton--text {
  height: 80px;
  width: 80%;
  margin: auto;
}

.skeleton--heatmap {
  height: 120px;
  width: 100%;
}

.skeleton--donut {
  height: 120px;
  width: 100%;
}

.skeleton--kpi {
  height: 60px;
  width: 60%;
}

.card-center {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
}

.empty-state {
  font-size: 13px;
  color: var(--text-muted);
  text-align: center;
  padding: 24px 0;
}
</style>
