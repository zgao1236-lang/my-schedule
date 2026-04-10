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

export const GCAL_COLORS = [
  { name: '默认蓝', hex: '#4285F4' },
  { name: '番茄红', hex: '#D50000' },
  { name: '火烈鸟', hex: '#E67C73' },
  { name: '橘橙色', hex: '#F4511E' },
  { name: '香蕉黄', hex: '#F6BF26' },
  { name: '鼠尾草', hex: '#33B679' },
  { name: '罗勒绿', hex: '#0B8043' },
  { name: '孔雀蓝', hex: '#039BE5' },
  { name: '蓝莓蓝', hex: '#3F51B5' },
  { name: '薰衣草', hex: '#7986CB' },
  { name: '葡萄紫', hex: '#8E24AA' },
  { name: '石墨灰', hex: '#616161' },
] as const

export const PRESET_COLORS = GCAL_COLORS.map((c) => c.hex)
export const DEFAULT_EVENT_COLOR = '#4285F4'

export const REMINDER_OPTIONS = [
  { label: '不提醒', value: null },
  { label: '提前 5 分钟', value: 5 },
  { label: '提前 15 分钟', value: 15 },
  { label: '提前 30 分钟', value: 30 },
  { label: '提前 1 小时', value: 60 },
  { label: '提前 1 天', value: 1440 },
] as const
