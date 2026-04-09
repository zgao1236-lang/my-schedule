import { useMemo, useCallback } from 'react'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { useCalendarStore } from '../../stores/useCalendarStore'
import { useEventStore } from '../../stores/useEventStore'
import { useSwipe } from '../../hooks/useSwipe'
import { NavButton, CheckCircle } from '../../components/ui'
import type { CalendarEvent, Period } from '../../types'

const BLOCKS: { key: Period; icon: string; label: string; time: string }[] = [
  { key: 'morning', icon: '🌅', label: '上午', time: '06:00 – 12:00' },
  { key: 'afternoon', icon: '☀️', label: '下午', time: '12:00 – 18:00' },
  { key: 'evening', icon: '🌙', label: '晚上', time: '18:00 – 24:00' },
]

function EventCard({ event, onToggle, onEdit }: {
  event: CalendarEvent; onToggle: () => void; onEdit: () => void
}) {
  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 press transition-opacity ${event.completed ? 'opacity-45' : ''}`}
      onClick={onEdit}
    >
      <CheckCircle checked={event.completed} color={event.color} onToggle={onToggle} />
      <div className="flex-1 min-w-0">
        <p className={`text-[15px] font-medium leading-snug ${event.completed ? 'line-through text-apple-label-tertiary' : 'text-apple-label'}`}>
          {event.title}
        </p>
        <p className="text-[13px] text-apple-label-tertiary mt-0.5">
          {event.startTime} – {event.endTime}
        </p>
      </div>
      <div className="w-[3px] h-8 rounded-full flex-shrink-0" style={{ backgroundColor: event.color }} />
    </div>
  )
}

export function DayView() {
  const { selectedDate, prevDay, nextDay, openAddModal, openEditModal } = useCalendarStore()
  const { events, updateEvent } = useEventStore()
  const swipeHandlers = useSwipe(nextDay, prevDay)

  const dayEvents = useMemo(
    () => events.filter((e) => e.date === selectedDate).sort((a, b) => a.startTime.localeCompare(b.startTime)),
    [events, selectedDate],
  )

  const byPeriod = useMemo(() => {
    const m: Record<Period, CalendarEvent[]> = { morning: [], afternoon: [], evening: [] }
    for (const e of dayEvents) m[e.period].push(e)
    return m
  }, [dayEvents])

  const toggleComplete = useCallback((event: CalendarEvent) => {
    updateEvent(event.id, { completed: !event.completed })
  }, [updateEvent])

  const dateLabel = format(new Date(selectedDate), 'yyyy年M月d日 EEEE', { locale: zhCN })

  return (
    <div className="flex flex-col gap-3" {...swipeHandlers}>
      {/* Navigation */}
      <div className="flex items-center justify-between">
        <NavButton direction="left" onClick={prevDay} />
        <h3 className="text-[15px] font-semibold text-apple-label">{dateLabel}</h3>
        <NavButton direction="right" onClick={nextDay} />
      </div>

      {/* Period blocks */}
      {BLOCKS.map((block) => {
        const items = byPeriod[block.key]
        return (
          <div key={block.key} className="card overflow-hidden">
            {/* Block header */}
            <div className="flex items-center gap-2.5 px-4 pt-4 pb-2">
              <span className="text-lg">{block.icon}</span>
              <span className="text-[15px] font-semibold text-apple-label">{block.label}</span>
              <span className="text-[13px] text-apple-label-tertiary">{block.time}</span>
              {items.length > 0 && (
                <span className="ml-auto text-[12px] text-apple-label-tertiary tabular-nums">
                  {items.filter((e) => e.completed).length}/{items.length}
                </span>
              )}
            </div>

            {/* Events */}
            {items.map((event, idx) => (
              <div key={event.id}>
                {idx > 0 && <div className="sep ml-14 mr-4" />}
                <EventCard
                  event={event}
                  onToggle={() => toggleComplete(event)}
                  onEdit={() => openEditModal(event)}
                />
              </div>
            ))}

            {/* Add */}
            <button
              onClick={() => openAddModal(selectedDate, block.key)}
              className="flex items-center gap-2.5 w-full px-4 py-3 text-apple-blue active:bg-apple-separator/50 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              <span className="text-[15px]">添加事项</span>
            </button>
          </div>
        )
      })}
    </div>
  )
}
