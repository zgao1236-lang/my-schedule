import { useMemo, useState, useRef } from 'react'
import { isSameMonth, isToday, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns'
import { formatDate } from '../../utils/date'
import { useCalendarStore } from '../../stores/useCalendarStore'
import { useEventStore } from '../../stores/useEventStore'
import type { CalendarEvent } from '../../types'

const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六']

/** Build a 5-or-6-row calendar grid (Sun start to match Google Calendar) */
function getMonthGrid(year: number, month: number): Date[] {
  const ms = startOfMonth(new Date(year, month))
  const me = endOfMonth(new Date(year, month))
  const start = startOfWeek(ms, { weekStartsOn: 0 })
  const end = endOfWeek(me, { weekStartsOn: 0 })
  return eachDayOfInterval({ start, end })
}

export function MonthView() {
  const { selectedDate, currentMonth, setSelectedDate, setViewMode, openEditModal, openAddModal } = useCalendarStore()
  const events = useEventStore((s) => s.events)

  // Slide animation state
  const [slideDir, setSlideDir] = useState<'left' | 'right' | null>(null)
  const animKey = useRef(0)

  const year = currentMonth.getFullYear()
  const month = currentMonth.getMonth()
  const days = useMemo(() => getMonthGrid(year, month), [year, month])
  const rows = Math.ceil(days.length / 7)

  // Index events by date
  const eventsByDate = useMemo(() => {
    const m = new Map<string, CalendarEvent[]>()
    for (const e of events) {
      const arr = m.get(e.date)
      if (arr) arr.push(e); else m.set(e.date, [e])
    }
    // Sort each day's events by startTime
    for (const arr of m.values()) arr.sort((a, b) => a.startTime.localeCompare(b.startTime))
    return m
  }, [events])

  const doSlide = (dir: 'left' | 'right', action: () => void) => {
    setSlideDir(dir)
    animKey.current++
    // Small delay to trigger CSS animation
    requestAnimationFrame(() => {
      action()
      setTimeout(() => setSlideDir(null), 220)
    })
  }

  const prevMonth = () => doSlide('right', () => useCalendarStore.getState().prevMonth())
  const nextMonth = () => doSlide('left', () => useCalendarStore.getState().nextMonth())

  // Swipe handling
  const touchStart = useRef(0)
  const touchY = useRef(0)
  const swiping = useRef(false)
  const lastX = useRef(0)

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStart.current = e.touches[0].clientX
    touchY.current = e.touches[0].clientY
    lastX.current = e.touches[0].clientX
    swiping.current = false
  }
  const handleTouchMove = (e: React.TouchEvent) => {
    lastX.current = e.touches[0].clientX
    const dx = lastX.current - touchStart.current
    const dy = e.touches[0].clientY - touchY.current
    if (Math.abs(dx) > Math.abs(dy) * 1.5 && Math.abs(dx) > 15) swiping.current = true
  }
  const handleTouchEnd = () => {
    if (!swiping.current) return
    const dx = lastX.current - touchStart.current
    if (dx > 50) prevMonth()
    else if (dx < -50) nextMonth()
  }

  // Long-press on cell to quick-add
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const handleCellPressStart = (dateStr: string) => {
    longPressTimer.current = setTimeout(() => {
      openAddModal(dateStr)
    }, 500)
  }
  const handleCellPressEnd = () => {
    if (longPressTimer.current) clearTimeout(longPressTimer.current)
  }

  return (
    <div
      className="select-none"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Weekday header */}
      <div className="grid grid-cols-7 border-b" style={{ borderColor: '#E0E0E0' }}>
        {WEEKDAYS.map((d) => (
          <div key={d} className="flex items-center justify-center"
            style={{ height: 32, fontSize: 12, fontWeight: 500, color: '#70757A' }}>
            {d}
          </div>
        ))}
      </div>

      {/* Grid with slide animation */}
      <div
        key={animKey.current}
        className={slideDir ? (slideDir === 'left' ? 'gcal-slide-left' : 'gcal-slide-right') : ''}
      >
        <div className="grid grid-cols-7" style={{ borderColor: '#E0E0E0' }}>
          {days.map((day, i) => {
            const dateStr = formatDate(day)
            const inMonth = isSameMonth(day, currentMonth)
            const todayMark = isToday(day)
            const selected = dateStr === selectedDate && !todayMark
            const dayEvents = eventsByDate.get(dateStr) || []
            const isLastRow = Math.floor(i / 7) === rows - 1

            return (
              <div
                key={dateStr}
                className="relative flex flex-col items-center border-b"
                style={{
                  minHeight: 80,
                  borderColor: '#F0F0F0',
                  borderBottomWidth: isLastRow ? 0 : 1,
                }}
                onClick={() => {
                  setSelectedDate(dateStr)
                  setViewMode('day')
                }}
                onTouchStart={() => handleCellPressStart(dateStr)}
                onTouchEnd={handleCellPressEnd}
                onTouchCancel={handleCellPressEnd}
                onContextMenu={(e) => { e.preventDefault(); openAddModal(dateStr) }}
              >
                {/* Date number */}
                <div className="flex items-center justify-center mt-1" style={{ width: 28, height: 28 }}>
                  {todayMark ? (
                    <div className="w-7 h-7 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: '#1A73E8' }}>
                      <span className="text-white" style={{ fontSize: 14, fontWeight: 500 }}>{day.getDate()}</span>
                    </div>
                  ) : selected ? (
                    <div className="w-7 h-7 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: '#E8F0FE' }}>
                      <span style={{ fontSize: 14, fontWeight: 500, color: '#1A73E8' }}>{day.getDate()}</span>
                    </div>
                  ) : (
                    <span style={{
                      fontSize: 14,
                      fontWeight: 400,
                      color: inMonth ? '#3C4043' : '#DADCE0',
                    }}>
                      {day.getDate()}
                    </span>
                  )}
                </div>

                {/* Event bars */}
                <div className="flex flex-col items-center gap-[3px] w-full mt-1 px-[4px] pb-1">
                  {dayEvents.slice(0, 3).map((ev) => (
                    <div
                      key={ev.id}
                      className="gcal-event-bar"
                      style={{
                        backgroundColor: ev.color || '#4285F4',
                        opacity: ev.completed ? 0.35 : 1,
                      }}
                      onClick={(e) => { e.stopPropagation(); openEditModal(ev) }}
                    />
                  ))}
                  {dayEvents.length > 3 && (
                    <span style={{ fontSize: 11, color: '#70757A', lineHeight: '14px' }}>
                      +{dayEvents.length - 3}
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <style>{`
        .gcal-event-bar {
          width: 85%;
          height: 6px;
          border-radius: 3px;
          cursor: pointer;
          transition: opacity 0.15s;
        }
        .gcal-event-bar:hover {
          opacity: 0.85 !important;
        }
        @keyframes gcalSlideLeft {
          from { opacity: 0; transform: translateX(30px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes gcalSlideRight {
          from { opacity: 0; transform: translateX(-30px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .gcal-slide-left {
          animation: gcalSlideLeft 0.2s ease-out;
        }
        .gcal-slide-right {
          animation: gcalSlideRight 0.2s ease-out;
        }
      `}</style>
    </div>
  )
}
