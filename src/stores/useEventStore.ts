import { create } from 'zustand'
import { v4 as uuid } from 'uuid'
import { db } from '../db'
import type { CalendarEvent } from '../types'

interface EventState {
  events: CalendarEvent[]
  loading: boolean
  loadEvents: () => Promise<void>
  addEvent: (event: Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>
  updateEvent: (id: string, updates: Partial<CalendarEvent>) => Promise<void>
  deleteEvent: (id: string) => Promise<void>
  getEventsByDate: (date: string) => CalendarEvent[]
}

export const useEventStore = create<EventState>((set, get) => ({
  events: [],
  loading: false,

  loadEvents: async () => {
    set({ loading: true })
    const events = await db.events.toArray()
    set({ events, loading: false })
  },

  addEvent: async (eventData) => {
    const now = Date.now()
    const event: CalendarEvent = {
      ...eventData,
      id: uuid(),
      createdAt: now,
      updatedAt: now,
    }
    await db.events.add(event)
    set({ events: [...get().events, event] })
  },

  updateEvent: async (id, updates) => {
    const updatedData = { ...updates, updatedAt: Date.now() }
    await db.events.update(id, updatedData)
    set({
      events: get().events.map((e) => (e.id === id ? { ...e, ...updatedData } : e)),
    })
  },

  deleteEvent: async (id) => {
    await db.events.delete(id)
    set({ events: get().events.filter((e) => e.id !== id) })
  },

  getEventsByDate: (date) => {
    return get().events.filter((e) => e.date === date)
  },
}))
