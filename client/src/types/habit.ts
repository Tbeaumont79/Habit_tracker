export interface Habit {
  id: string
  name: string
  description: string | null
  icon: string
  color: string
  frequency: 'DAILY' | 'WEEKLY' | 'CUSTOM'
  targetDays: number
  category: string | null
  position: number
  isArchived: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateHabitData {
  name: string
  description?: string | null
  icon?: string
  color?: string
  frequency?: 'DAILY' | 'WEEKLY' | 'CUSTOM'
  targetDays?: number
  category?: string | null
}

export type UpdateHabitData = Partial<CreateHabitData & { isArchived: boolean; position: number }>

export interface HabitLog {
  id: string
  habitId: string
  date: string
  completed: boolean
  note: string | null
  createdAt: string
}
