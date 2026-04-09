import { create } from 'zustand'
import { addDays, subDays, addWeeks, subWeeks, addMonths, subMonths, startOfWeek } from 'date-fns'
import { formatDate, todayStr } from '../utils/date'
import type { CalendarViewMode, CalendarEvent } from '../types'

interface CalendarState {
  viewMode: CalendarViewMode
  selectedDate: string
  currentMonth: Date
  weekStart: Date
  editingEvent: CalendarEvent | null
  modalOpen: boolean
  modalDefaultDate: string | null
  modalDefaultPeriod: 'morning' | 'afternoon' | 'evening' | null

  setViewMode: (mode: CalendarViewMode) => void
  setSelectedDate: (date: string) => void
  goToToday: () => void
  prevMonth: () => void
  nextMonth: () => void
  prevWeek: () => void
  nextWeek: () => void
  prevDay: () => void
  nextDay: () => void
  openAddModal: (date?: string, period?: 'morning' | 'afternoon' | 'evening') => void
  openEditModal: (event: CalendarEvent) => void
  closeModal: () => void
}

const today = new Date()

export const useCalendarStore = create<CalendarState>((set) => ({
  viewMode: 'month',
  selectedDate: todayStr(),
  currentMonth: today,
  weekStart: startOfWeek(today, { weekStartsOn: 1 }),
  editingEvent: null,
  modalOpen: false,
  modalDefaultDate: null,
  modalDefaultPeriod: null,

  setViewMode: (mode) => set({ viewMode: mode }),

  setSelectedDate: (date) => set({ selectedDate: date }),

  goToToday: () => {
    const now = new Date()
    set({
      selectedDate: formatDate(now),
      currentMonth: now,
      weekStart: startOfWeek(now, { weekStartsOn: 1 }),
    })
  },

  prevMonth: () => set((s) => ({ currentMonth: subMonths(s.currentMonth, 1) })),
  nextMonth: () => set((s) => ({ currentMonth: addMonths(s.currentMonth, 1) })),

  prevWeek: () => set((s) => ({
    weekStart: subWeeks(s.weekStart, 1),
    selectedDate: formatDate(subWeeks(startOfWeek(new Date(s.selectedDate), { weekStartsOn: 1 }), 1)),
  })),
  nextWeek: () => set((s) => ({
    weekStart: addWeeks(s.weekStart, 1),
    selectedDate: formatDate(addWeeks(startOfWeek(new Date(s.selectedDate), { weekStartsOn: 1 }), 1)),
  })),

  prevDay: () => set((s) => ({ selectedDate: formatDate(subDays(new Date(s.selectedDate), 1)) })),
  nextDay: () => set((s) => ({ selectedDate: formatDate(addDays(new Date(s.selectedDate), 1)) })),

  openAddModal: (date, period) => set({
    editingEvent: null,
    modalOpen: true,
    modalDefaultDate: date ?? null,
    modalDefaultPeriod: period ?? null,
  }),

  openEditModal: (event) => set({
    editingEvent: event,
    modalOpen: true,
    modalDefaultDate: null,
    modalDefaultPeriod: null,
  }),

  closeModal: () => set({
    modalOpen: false,
    editingEvent: null,
    modalDefaultDate: null,
    modalDefaultPeriod: null,
  }),
}))
