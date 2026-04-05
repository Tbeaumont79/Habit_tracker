export interface TodayStats {
  completed: number
  total: number
  rate: number
}

export interface BestStreak {
  habitId: string
  habitName: string
  count: number
}

export interface CurrentStreak {
  habitId: string
  habitName: string
  count: number
}

export interface Streaks {
  best: BestStreak
  current: CurrentStreak[]
}

export interface ThisMonthStats {
  completions: number
  previousMonth: number
}

export interface CategoryData {
  category: string
  count: number
  percentage: number
}

export interface HeatmapData {
  habitId: string
  habitName: string
  days: boolean[]
}

export interface Stats {
  today: TodayStats
  streaks: Streaks
  thisMonth: ThisMonthStats
  activeHabits: number
  categoryBreakdown: CategoryData[]
  weeklyHeatmap: HeatmapData[]
}
