import { useCalendarStore } from '../../stores/useCalendarStore'
import { useEventStore } from '../../stores/useEventStore'
import { todayStr } from '../../utils/date'
import { GradIcon } from '../../components/ui'
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
  const { viewMode, setViewMode, openAddModal, selectedDate } = useCalendarStore()
  const events = useEventStore((s) => s.events)

  const today = todayStr()
  const todayEvents = events.filter((e) => e.date === today)
  const done = todayEvents.filter((e) => e.completed).length

  return (
    <div className="flex flex-col gap-4 px-5 pt-4 pb-5">
      {/* Summary + View switcher */}
      <div className="flex items-center gap-3">
        <div className="flex gap-2 flex-1">
          {/* Today count */}
          <div className="card-sm flex items-center gap-2.5 px-3.5 py-2.5">
            <GradIcon gradient="grad-blue" size="sm">
              <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </GradIcon>
            <div>
              <p className="text-[20px] font-bold text-apple-label leading-none tabular-nums">{todayEvents.length}</p>
              <p className="text-[11px] text-apple-label-tertiary mt-0.5">今日</p>
            </div>
          </div>
          {/* Done count */}
          <div className="card-sm flex items-center gap-2.5 px-3.5 py-2.5">
            <GradIcon gradient="grad-green" size="sm">
              <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </GradIcon>
            <div>
              <p className="text-[20px] font-bold text-apple-label leading-none tabular-nums">{done}</p>
              <p className="text-[11px] text-apple-label-tertiary mt-0.5">完成</p>
            </div>
          </div>
        </div>

        {/* View switcher */}
        <div className="flex input-bg rounded-xl p-1">
          {VIEWS.map((v) => (
            <button
              key={v.key}
              onClick={() => setViewMode(v.key)}
              className={`px-3.5 py-1.5 rounded-lg text-[13px] font-medium transition-all duration-200 ${
                viewMode === v.key
                  ? 'bg-apple-card shadow-sm text-apple-label'
                  : 'text-apple-label-secondary'
              }`}
            >
              {v.label}
            </button>
          ))}
        </div>
      </div>

      {/* View */}
      <div key={viewMode} className="page-enter">
        {viewMode === 'month' && <MonthView />}
        {viewMode === 'week' && <WeekView />}
        {viewMode === 'day' && <DayView />}
      </div>

      {/* FAB */}
      {viewMode !== 'day' && (
        <button
          onClick={() => openAddModal(selectedDate)}
          className="fixed bottom-[calc(64px+var(--safe-area-bottom,0px))] right-[max(20px,calc((100vw-430px)/2+20px))] w-14 h-14 rounded-2xl bg-apple-blue flex items-center justify-center shadow-lg shadow-apple-blue/25 active:scale-95 transition-transform z-30"
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
