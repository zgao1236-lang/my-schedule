import { format, parse, startOfMonth, endOfMonth, eachDayOfInterval, getDay, startOfWeek, endOfWeek } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import type { Period } from '../types'

export function formatDate(date: Date, fmt: string = 'yyyy-MM-dd'): string {
  return format(date, fmt, { locale: zhCN })
}

export function parseDate(dateStr: string): Date {
  return parse(dateStr, 'yyyy-MM-dd', new Date())
}

export function getMonthDays(year: number, month: number): Date[] {
  const start = startOfMonth(new Date(year, month))
  const end = endOfMonth(new Date(year, month))
  return eachDayOfInterval({ start, end })
}

export function getCalendarDays(year: number, month: number): Date[] {
  const monthStart = startOfMonth(new Date(year, month))
  const monthEnd = endOfMonth(new Date(year, month))
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 })
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })
  return eachDayOfInterval({ start: calendarStart, end: calendarEnd })
}

export function getPeriodFromTime(time: string): Period {
  const hour = parseInt(time.split(':')[0], 10)
  if (hour < 12) return 'morning'
  if (hour < 18) return 'afternoon'
  return 'evening'
}

export function getPeriodLabel(period: Period): string {
  const labels: Record<Period, string> = {
    morning: '上午',
    afternoon: '下午',
    evening: '晚上',
  }
  return labels[period]
}

export function getWeekdayLabel(day: number): string {
  const labels = ['日', '一', '二', '三', '四', '五', '六']
  return labels[day]
}

export function getDayOfWeek(date: Date): number {
  return getDay(date)
}

export function todayStr(): string {
  return formatDate(new Date())
}
