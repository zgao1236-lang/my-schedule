import { useMemo } from 'react'
import { format, isSameMonth, isToday } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { getCalendarDays, formatDate } from '../../utils/date'
import { useCalendarStore } from '../../stores/useCalendarStore'
import { useEventStore } from '../../stores/useEventStore'
import { NavButton } from '../../components/ui'
import { useSwipe } from '../../hooks/useSwipe'

const WEEKDAYS = ['一', '二', '三', '四', '五', '六', '日']

export function MonthView() {
  const { selectedDate, currentMonth, setSelectedDate, setViewMode, goToToday, prevMonth, nextMonth } = useCalendarStore()
  const events = useEventStore((s) => s.events)
  const swipeHandlers = useSwipe(nextMonth, prevMonth)

  const year = currentMonth.getFullYear()
  const month = currentMonth.getMonth()
  const days = useMemo(() => getCalendarDays(year, month), [year, month])

  const eventsByDate = useMemo(() => {
    const map = new Map<string, typeof events>()
    for (const e of events) {
      const arr = map.get(e.date)
      if (arr) arr.push(e); else map.set(e.date, [e])
    }
    return map
  }, [events])

  return (
    <div className="card overflow-hidden" {...swipeHandlers}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <NavButton direction="left" onClick={prevMonth} />
        <button onClick={goToToday} className="active:opacity-50 transition-opacity">
          <h2 className="text-[17px] font-semibold text-apple-label">
            {format(currentMonth, 'yyyy年M月', { locale: zhCN })}
          </h2>
        </button>
        <NavButton direction="right" onClick={nextMonth} />
      </div>

      {/* Weekday row */}
      <div className="grid grid-cols-7 px-3">
        {WEEKDAYS.map((d) => (
          <div key={d} className="text-center text-[11px] font-semibold text-apple-label-tertiary py-2">{d}</div>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7 px-3 pb-3 gap-y-0.5">
        {days.map((day) => {
          const dateStr = formatDate(day)
          const inMonth = isSameMonth(day, currentMonth)
          const todayMark = isToday(day)
          const selected = dateStr === selectedDate
          const dayEvents = eventsByDate.get(dateStr)

          return (
            <button
              key={dateStr}
              onClick={() => { setSelectedDate(dateStr); setViewMode('day') }}
              className="relative flex flex-col items-center justify-center h-11 rounded-xl transition-all"
            >
              {selected && <div className="absolute inset-[3px] rounded-[10px] bg-apple-blue" />}
              {todayMark && !selected && <div className="absolute inset-[3px] rounded-[10px] ring-[1.5px] ring-apple-blue" />}

              <span className={`relative z-10 text-[15px]
                ${selected ? 'font-semibold text-white' : ''}
                ${todayMark && !selected ? 'font-bold text-apple-blue' : ''}
                ${!selected && !todayMark && inMonth ? 'text-apple-label' : ''}
                ${!inMonth ? 'text-apple-label-tertiary/30' : ''}
              `}>
                {day.getDate()}
              </span>

              {dayEvents && dayEvents.length > 0 && (
                <div className="absolute bottom-[3px] flex gap-[2px]">
                  {dayEvents.slice(0, 3).map((e, i) => (
                    <span key={i} className="w-1 h-1 rounded-full"
                      style={{ backgroundColor: selected ? 'rgba(255,255,255,0.8)' : e.completed ? '#C7C7CC' : e.color }}
                    />
                  ))}
                </div>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
