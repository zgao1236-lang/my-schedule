export type Period = 'morning' | 'afternoon' | 'evening'

export type RepeatType = 'daily' | 'weekly' | 'yearly'

export interface RepeatRule {
  type: RepeatType
  weekdays?: number[] // 0-6, 0=Sunday
  endDate?: string // YYYY-MM-DD
  endCount?: number
}

export interface EventReminder {
  minutesBefore: number
}

export interface CalendarEvent {
  id: string
  title: string
  description: string
  date: string // YYYY-MM-DD
  startTime: string // HH:mm
  endTime: string // HH:mm
  period: Period
  completed: boolean
  color: string
  repeat: RepeatRule | null
  repeatGroupId: string | null
  isRepeatException: boolean
  reminder: EventReminder | null
  reminded: boolean
  createdAt: number
  updatedAt: number
}

export interface Folder {
  id: string
  name: string
  parentId: string | null
  order: number
  createdAt: number
  updatedAt: number
}

export interface Note {
  id: string
  folderId: string
  title: string
  content: string // HTML
  createdAt: number
  updatedAt: number
}

export type TabType = 'calendar' | 'notes' | 'reminders' | 'search'

export type CalendarViewMode = 'month' | 'week' | 'day'

export const PRESET_COLORS = [
  '#007AFF',
  '#FF3B30',
  '#34C759',
  '#FF9500',
  '#AF52DE',
  '#5856D6',
] as const

export const REMINDER_OPTIONS = [
  { label: '不提醒', value: null },
  { label: '提前 5 分钟', value: 5 },
  { label: '提前 15 分钟', value: 15 },
  { label: '提前 30 分钟', value: 30 },
  { label: '提前 1 小时', value: 60 },
  { label: '提前 1 天', value: 1440 },
] as const
