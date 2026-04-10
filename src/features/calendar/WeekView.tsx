import { useMemo, useEffect, useRef, useState } from 'react'
import { addDays, isToday } from 'date-fns'
import { formatDate, todayStr, getPeriodFromTime } from '../../utils/date'
import { useCalendarStore } from '../../stores/useCalendarStore'
import { useEventStore } from '../../stores/useEventStore'
import type { CalendarEvent } from '../../types'

/* ── Constants ── */
const HOUR_H = 56          // px per hour
const HOURS = Array.from({ length: 24 }, (_, i) => i)
const GRID_H = HOUR_H * 24 // total grid height
const TIME_COL_W = 40       // left time gutter width
const WD = ['日', '一', '二', '三', '四', '五', '六']

/* ── Helpers ── */
function timeToMin(t: string) {
  const [h, m] = t.split(':').map(Number)
  return h * 60 + m
}
function minToPx(min: number) {
  return (min / 60) * HOUR_H
}
function snapTo30(min: number) {
  return Math.round(min / 30) * 30
}
function minToTimeStr(min: number) {
  const h = Math.floor(min / 60) % 24
  const m = min % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

/** Darken a hex color by ~20% for the left border */
function darken(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  const d = (v: number) => Math.max(0, Math.round(v * 0.75))
  return `rgb(${d(r)},${d(g)},${d(b)})`
}

/** Layout overlapping events into columns */
interface LayoutSlot { event: CalendarEvent; col: number; totalCols: number; startMin: number; endMin: number }

function layoutEvents(events: CalendarEvent[]): LayoutSlot[] {
  if (events.length === 0) return []
  const sorted = [...events].sort((a, b) => timeToMin(a.startTime) - timeToMin(b.startTime))
  const slots: LayoutSlot[] = []
  const groups: { endMin: number; col: number }[][] = []

  for (const ev of sorted) {
    const sMin = timeToMin(ev.startTime)
    const eMin = Math.max(timeToMin(ev.endTime), sMin + 15)

    // Find a group that overlaps
    let placed = false
    for (const group of groups) {
      const overlaps = group.some((g) => sMin < g.endMin)
      if (overlaps) {
        // Find first free column
        const usedCols = new Set(group.filter((g) => sMin < g.endMin).map((g) => g.col))
        let col = 0
        while (usedCols.has(col)) col++
        group.push({ endMin: eMin, col })
        slots.push({ event: ev, col, totalCols: 0, startMin: sMin, endMin: eMin })
        placed = true
        break
      }
    }
    if (!placed) {
      groups.push([{ endMin: eMin, col: 0 }])
      slots.push({ event: ev, col: 0, totalCols: 0, startMin: sMin, endMin: eMin })
    }
  }

  // Compute totalCols for each group
  let slotIdx = 0
  for (const group of groups) {
    const maxCol = Math.max(...group.map((g) => g.col)) + 1
    for (let i = 0; i < group.length; i++) {
      slots[slotIdx + i].totalCols = maxCol
    }
    slotIdx += group.length
  }

  return slots
}

/* ── Current Time Line ── */
function NowLine() {
  const [min, setMin] = useState(() => {
    const d = new Date()
    return d.getHours() * 60 + d.getMinutes()
  })

  useEffect(() => {
    const iv = setInterval(() => {
      const d = new Date()
      setMin(d.getHours() * 60 + d.getMinutes())
    }, 60_000)
    return () => clearInterval(iv)
  }, [])

  const top = minToPx(min)
  return (
    <div className="absolute left-0 right-0 z-20 pointer-events-none" style={{ top }}>
      <div className="relative flex items-center">
        <div className="absolute rounded-full" style={{ width: 10, height: 10, backgroundColor: '#EA4335', left: -5, top: -4 }} />
        <div className="w-full" style={{ height: 2, backgroundColor: '#EA4335' }} />
      </div>
    </div>
  )
}

/* ── Event Block ── */
function EventBlock({ slot, onClick }: {
  slot: LayoutSlot
  onClick: () => void
}) {
  const { event, col, totalCols, startMin, endMin } = slot
  const duration = endMin - startMin
  const top = minToPx(startMin)
  const height = Math.max(minToPx(duration), minToPx(15))
  // Percentage-based inside the column div
  const widthPct = 92 / totalCols
  const leftPct = col * widthPct + 2
  const color = event.color || '#4285F4'
  const isShort = duration < 30

  return (
    <div
      className="absolute cursor-pointer overflow-hidden"
      style={{
        top,
        left: `${leftPct}%`,
        width: `calc(${widthPct}% - 2px)`,
        height,
        borderRadius: 6,
        backgroundColor: color,
        borderLeft: `4px solid ${darken(color)}`,
        opacity: event.completed ? 0.45 : 1,
        zIndex: 10 + col,
        padding: '3px 5px',
      }}
      onClick={(e) => { e.stopPropagation(); onClick() }}
    >
      <p style={{
        color: '#fff',
        fontSize: isShort ? 11 : 12,
        fontWeight: 500,
        lineHeight: '14px',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        textDecoration: event.completed ? 'line-through' : 'none',
      }}>
        {event.title}
      </p>
      {!isShort && (
        <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: 11, lineHeight: '14px', marginTop: 1 }}>
          {event.startTime} – {event.endTime}
        </p>
      )}
    </div>
  )
}

/* ── Main Component ── */
export function WeekView() {
  const { weekStart, prevWeek, nextWeek, openEditModal, openAddModal } = useCalendarStore()
  const events = useEventStore((s) => s.events)
  const scrollRef = useRef<HTMLDivElement>(null)

  const weekDays = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)), [weekStart])
  const today = todayStr()
  const todayColIdx = weekDays.findIndex((d) => formatDate(d) === today)

  // Index events by date
  const eventsByDate = useMemo(() => {
    const m = new Map<string, CalendarEvent[]>()
    for (const e of events) {
      const arr = m.get(e.date)
      if (arr) arr.push(e); else m.set(e.date, [e])
    }
    return m
  }, [events])

  // Auto-scroll to current time or 8am
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    if (todayColIdx >= 0) {
      const now = new Date()
      const scrollTo = minToPx(now.getHours() * 60 + now.getMinutes()) - el.clientHeight / 3
      el.scrollTop = Math.max(0, scrollTo)
    } else {
      el.scrollTop = minToPx(8 * 60) - 20
    }
  }, [weekStart, todayColIdx])

  // Swipe
  const touchStartX = useRef(0)
  const touchLastX = useRef(0)
  const swiping = useRef(false)
  const touchStartY = useRef(0)

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
    touchLastX.current = e.touches[0].clientX
    touchStartY.current = e.touches[0].clientY
    swiping.current = false
  }
  const handleTouchMove = (e: React.TouchEvent) => {
    touchLastX.current = e.touches[0].clientX
    const dx = touchLastX.current - touchStartX.current
    const dy = e.touches[0].clientY - touchStartY.current
    if (Math.abs(dx) > Math.abs(dy) * 2 && Math.abs(dx) > 15) swiping.current = true
  }
  const handleTouchEnd = () => {
    if (!swiping.current) return
    const dx = touchLastX.current - touchStartX.current
    if (dx > 50) prevWeek()
    else if (dx < -50) nextWeek()
  }

  // Click on grid empty area → quick create
  const handleGridClick = (dayIdx: number, e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const y = e.clientY - rect.top + (scrollRef.current?.scrollTop || 0)
    const minutes = snapTo30(Math.floor((y / HOUR_H) * 60))
    const dateStr = formatDate(weekDays[dayIdx])
    const timeStr = minToTimeStr(minutes)
    const period = getPeriodFromTime(timeStr)
    openAddModal(dateStr, period, timeStr)
  }

  return (
    <div
      className="flex flex-col select-none"
      style={{ height: 'calc(100dvh - 52px - 52px - var(--safe-area-bottom, 0px))' }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* ── Sticky date header ── */}
      <div className="flex-shrink-0 bg-white sticky top-0 z-30" style={{ borderBottom: '1px solid #DADCE0' }}>
        <div className="flex">
          {/* Time gutter spacer */}
          <div style={{ width: TIME_COL_W, flexShrink: 0 }} />
          {/* 7 day columns */}
          {weekDays.map((day, i) => {
            const isTd = isToday(day)
            return (
              <div key={i} className="flex-1 flex flex-col items-center py-1.5" style={{ minWidth: 0 }}>
                <span style={{
                  fontSize: 12,
                  fontWeight: 500,
                  color: isTd ? '#1A73E8' : '#70757A',
                  lineHeight: '16px',
                }}>
                  {WD[day.getDay()]}
                </span>
                <div
                  className="flex items-center justify-center mt-0.5"
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    backgroundColor: isTd ? '#1A73E8' : 'transparent',
                  }}
                >
                  <span style={{
                    fontSize: 20,
                    fontWeight: 500,
                    color: isTd ? '#FFFFFF' : '#3C4043',
                    lineHeight: '24px',
                  }}>
                    {day.getDate()}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Scrollable time grid ── */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto overflow-x-hidden"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        <div className="flex relative" style={{ height: GRID_H }}>
          {/* Left time gutter */}
          <div className="flex-shrink-0 relative" style={{ width: TIME_COL_W }}>
            {HOURS.map((h) => (
              <div
                key={h}
                className="absolute right-1 text-right"
                style={{
                  top: h * HOUR_H - 7,
                  fontSize: 11,
                  color: '#70757A',
                  lineHeight: '14px',
                  display: h === 0 ? 'none' : 'block',
                }}
              >
                {String(h).padStart(2, '0')}
              </div>
            ))}
          </div>

          {/* 7 day columns */}
          {weekDays.map((day, dayIdx) => {
            const dateStr = formatDate(day)
            const dayEvents = eventsByDate.get(dateStr) || []
            const slots = layoutEvents(dayEvents)
            const isTd = isToday(day)

            return (
              <div
                key={dayIdx}
                className="flex-1 relative"
                style={{
                  borderLeft: '1px solid #EBEBEB',
                  minWidth: 0,
                }}
                onClick={(e) => handleGridClick(dayIdx, e)}
              >
                {/* Hour lines */}
                {HOURS.map((h) => (
                  <div key={h}>
                    <div
                      className="absolute left-0 right-0"
                      style={{ top: h * HOUR_H, height: 1, backgroundColor: '#DADCE0' }}
                    />
                    {/* Half-hour dashed line */}
                    <div
                      className="absolute left-0 right-0"
                      style={{
                        top: h * HOUR_H + HOUR_H / 2,
                        height: 1,
                        backgroundImage: 'linear-gradient(to right, #EBEBEB 50%, transparent 50%)',
                        backgroundSize: '8px 1px',
                      }}
                    />
                  </div>
                ))}

                {/* Now line — only on today's column */}
                {isTd && <NowLine />}

                {/* Event blocks */}
                {slots.map((slot) => (
                  <EventBlock
                    key={slot.event.id}
                    slot={slot}
                    onClick={() => openEditModal(slot.event)}
                  />
                ))}
              </div>
            )
          })}
        </div>
      </div>

    </div>
  )
}
