import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { useCalendarStore } from '../../stores/useCalendarStore'
import { MonthView } from './MonthView'
import { WeekView } from './WeekView'
import { DayView } from './DayView'
import { EventModal } from './EventModal'
import type { CalendarViewMode } from '../../types'

const VIEWS: { key: CalendarViewMode; label: string }[] = [
  { key: 'month', label: '月' },
  { key: 'week', label: '周' },
  { key: 'day', label: '日' },
]

export function CalendarPage() {
  const { viewMode, setViewMode, currentMonth, goToToday, openAddModal, selectedDate, prevMonth, nextMonth } = useCalendarStore()

  const monthLabel = format(currentMonth, 'M月', { locale: zhCN })
  const yearLabel = format(currentMonth, 'yyyy', { locale: zhCN })

  return (
    <div className="flex flex-col">
      {/* ── Google Calendar-style top bar ── */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-apple-card border-b border-apple-separator">
        <div className="flex items-center gap-2">
          {/* Month nav arrows */}
          <button onClick={prevMonth} className="w-9 h-9 flex items-center justify-center rounded-full active:bg-[#F1F3F4] transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="#5F6368" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button onClick={nextMonth} className="w-9 h-9 flex items-center justify-center rounded-full active:bg-[#F1F3F4] transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="#5F6368" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
          {/* Month title */}
          <div className="ml-1">
            <span className="text-[22px] font-normal" style={{ color: '#3C4043' }}>{monthLabel}</span>
            <span className="text-[22px] font-normal ml-1" style={{ color: '#70757A' }}>{yearLabel}</span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {/* Today button */}
          <button
            onClick={goToToday}
            className="px-3 py-1.5 rounded-md text-[13px] font-medium active:bg-[#F1F3F4] transition-colors"
            style={{ color: '#1A73E8', border: '1px solid #DADCE0' }}
          >
            今天
          </button>

          {/* View mode switcher */}
          <div className="flex ml-1 rounded-lg overflow-hidden" style={{ border: '1px solid #DADCE0' }}>
            {VIEWS.map((v) => (
              <button
                key={v.key}
                onClick={() => setViewMode(v.key)}
                className="px-2.5 py-1.5 text-[12px] font-medium transition-colors"
                style={{
                  color: viewMode === v.key ? '#1A73E8' : '#5F6368',
                  backgroundColor: viewMode === v.key ? '#E8F0FE' : 'transparent',
                }}
              >
                {v.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Active View ── */}
      <div className="bg-white">
        {viewMode === 'month' && <MonthView />}
      </div>
      {viewMode === 'week' && (
        <div className="px-5 pt-3 pb-5">
          <WeekView />
        </div>
      )}
      {viewMode === 'day' && (
        <div className="px-5 pt-3 pb-5">
          <DayView />
        </div>
      )}

      {/* FAB */}
      {viewMode !== 'day' && (
        <button
          onClick={() => openAddModal(selectedDate)}
          className="fixed bottom-[calc(64px+var(--safe-area-bottom,0px))] right-[max(20px,calc((100vw-430px)/2+20px))] w-14 h-14 rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-transform z-30"
          style={{ backgroundColor: '#1A73E8', boxShadow: '0 4px 12px rgba(26,115,232,0.4)' }}
        >
          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
        </button>
      )}

      <EventModal />
    </div>
  )
}
