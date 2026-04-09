import { useMemo } from 'react'
import { addDays, format, isToday } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { formatDate } from '../../utils/date'
import { useCalendarStore } from '../../stores/useCalendarStore'
import { useEventStore } from '../../stores/useEventStore'
import { NavButton } from '../../components/ui'
import { useSwipe } from '../../hooks/useSwipe'

const WD = ['一', '二', '三', '四', '五', '六', '日']

export function WeekView() {
  const { weekStart, selectedDate, setSelectedDate, setViewMode, prevWeek, nextWeek } = useCalendarStore()
  const events = useEventStore((s) => s.events)
  const swipeHandlers = useSwipe(nextWeek, prevWeek)

  const weekDays = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)), [weekStart])

  const eventsByDate = useMemo(() => {
    const map = new Map<string, typeof events>()
    for (const e of events) {
      const arr = map.get(e.date); if (arr) arr.push(e); else map.set(e.date, [e])
    }
    return map
  }, [events])

  const weekLabel = `${format(weekDays[0], 'M/d', { locale: zhCN })} – ${format(weekDays[6], 'M/d')}`

  return (
    <div className="flex flex-col gap-3" {...swipeHandlers}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <NavButton direction="left" onClick={prevWeek} />
        <span className="text-[15px] font-semibold text-apple-label">{weekLabel}</span>
        <NavButton direction="right" onClick={nextWeek} />
      </div>

      {/* 7 columns */}
      <div className="grid grid-cols-7 gap-1.5">
        {weekDays.map((day) => {
          const dateStr = formatDate(day)
          const todayMark = isToday(day)
          const dayEvents = (eventsByDate.get(dateStr) || []).sort((a, b) => a.startTime.localeCompare(b.startTime))
          const idx = (day.getDay() + 6) % 7

          return (
            <button
              key={dateStr}
              onClick={() => { setSelectedDate(dateStr); setViewMode('day') }}
              className="card-sm flex flex-col items-center pt-2 pb-2.5 min-h-[130px] press"
            >
              <span className="text-[10px] font-semibold text-apple-label-tertiary">{WD[idx]}</span>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center mt-1 mb-2 ${
                todayMark ? 'bg-apple-blue' : ''
              }`}>
                <span className={`text-[13px] font-semibold ${todayMark ? 'text-white' : 'text-apple-label'}`}>
                  {day.getDate()}
                </span>
              </div>
              <div className="w-full px-1 flex flex-col gap-1">
                {dayEvents.slice(0, 3).map((e) => (
                  <div key={e.id} className="w-full rounded px-1 py-[2px]"
                    style={{ backgroundColor: e.completed ? 'var(--c-input)' : `${e.color}14` }}>
                    <p className="text-[9px] leading-tight truncate font-medium"
                      style={{ color: e.completed ? 'var(--c-label-tertiary)' : e.color,
                        textDecoration: e.completed ? 'line-through' : 'none' }}>
                      {e.title}
                    </p>
                  </div>
                ))}
                {dayEvents.length > 3 && (
                  <span className="text-[9px] text-apple-label-tertiary text-center">+{dayEvents.length - 3}</span>
                )}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
