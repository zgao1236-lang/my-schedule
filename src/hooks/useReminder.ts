import { useEffect, useRef } from 'react'
import { useEventStore } from '../stores/useEventStore'
import { todayStr } from '../utils/date'
import { db } from '../db'

/** Request Notification permission once on mount */
function requestNotificationPermission() {
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission()
  }
}

/** Parse "HH:mm" into total minutes since midnight */
function timeToMinutes(t: string): number {
  const [h, m] = t.split(':').map(Number)
  return h * 60 + m
}

/** Get current minutes since midnight */
function nowMinutes(): number {
  const d = new Date()
  return d.getHours() * 60 + d.getMinutes()
}

function sendNotification(title: string, body: string) {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(title, { body, icon: '/favicon.svg' })
  }
}

export function useReminder() {
  const events = useEventStore((s) => s.events)
  const updateEvent = useEventStore((s) => s.updateEvent)
  const loadEvents = useEventStore((s) => s.loadEvents)
  const lastResetDay = useRef<string>('')

  useEffect(() => {
    requestNotificationPermission()
  }, [])

  useEffect(() => {
    const check = async () => {
      const today = todayStr()
      const now = nowMinutes()

      // Reset reminded flags at midnight (when day changes)
      if (lastResetDay.current && lastResetDay.current !== today) {
        const allEvents = await db.events.where('reminded').equals(1).toArray()
        for (const e of allEvents) {
          await db.events.update(e.id, { reminded: false })
        }
        await loadEvents()
      }
      lastResetDay.current = today

      // Check today's events with reminders
      const todayEvents = events.filter(
        (e) => e.date === today && e.reminder && !e.reminded && !e.completed,
      )

      for (const event of todayEvents) {
        const eventMin = timeToMinutes(event.startTime)
        const triggerMin = eventMin - event.reminder!.minutesBefore
        if (now >= triggerMin) {
          sendNotification(event.title, `${event.startTime} – ${event.endTime}`)
          await updateEvent(event.id, { reminded: true })
        }
      }
    }

    check()
    const interval = setInterval(check, 60_000)
    return () => clearInterval(interval)
  }, [events, updateEvent, loadEvents])
}
