import { useState, useMemo, useCallback } from 'react'
import { format, addDays, differenceInDays } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { useEventStore } from '../../stores/useEventStore'
import { useCalendarStore } from '../../stores/useCalendarStore'
import { useAppStore } from '../../stores/useAppStore'
import { todayStr } from '../../utils/date'
import { EventRow, EmptyState, SectionTitle, GradIcon } from '../../components/ui'
import type { CalendarEvent, Period } from '../../types'

function timeToMinutes(t: string) { const [h, m] = t.split(':').map(Number); return h * 60 + m }
function nowMinutes() { const d = new Date(); return d.getHours() * 60 + d.getMinutes() }
function isOverdue(e: CalendarEvent, today: string) { return !e.completed && e.date === today && nowMinutes() > timeToMinutes(e.endTime) }

function relativeLabel(dateStr: string, today: string) {
  const diff = differenceInDays(new Date(dateStr), new Date(today))
  if (diff === 1) return '明天'
  if (diff === 2) return '后天'
  return format(new Date(dateStr), 'EEEE', { locale: zhCN })
}

const PERIODS: { key: Period; icon: string; label: string }[] = [
  { key: 'morning', icon: '🌅', label: '上午' },
  { key: 'afternoon', icon: '☀️', label: '下午' },
  { key: 'evening', icon: '🌙', label: '晚上' },
]

export function RemindersPage() {
  const events = useEventStore((s) => s.events)
  const updateEvent = useEventStore((s) => s.updateEvent)
  const setActiveTab = useAppStore((s) => s.setActiveTab)
  const { setSelectedDate, setViewMode } = useCalendarStore()
  const [overdueOpen, setOverdueOpen] = useState(false)

  const today = todayStr()
  const todayDate = new Date()
  const notifOK = typeof Notification !== 'undefined' && Notification.permission === 'granted'

  const todayEvents = useMemo(() => events.filter((e) => e.date === today).sort((a, b) => a.startTime.localeCompare(b.startTime)), [events, today])
  const byPeriod = useMemo(() => {
    const m: Record<Period, CalendarEvent[]> = { morning: [], afternoon: [], evening: [] }
    for (const e of todayEvents) m[e.period].push(e)
    return m
  }, [todayEvents])
  const overdueEvents = useMemo(() => todayEvents.filter((e) => isOverdue(e, today)), [todayEvents, today])
  const done = todayEvents.filter((e) => e.completed).length

  const upcoming = useMemo(() => {
    const groups: { date: string; label: string; events: CalendarEvent[] }[] = []
    for (let i = 1; i <= 7; i++) {
      const d = format(addDays(todayDate, i), 'yyyy-MM-dd')
      const items = events.filter((e) => e.date === d && !e.completed).sort((a, b) => a.startTime.localeCompare(b.startTime))
      if (items.length > 0) groups.push({ date: d, label: `${relativeLabel(d, today)} (${format(new Date(d), 'M月d日')})`, events: items })
    }
    return groups
  }, [events, today, todayDate])

  const toggle = useCallback((e: CalendarEvent) => updateEvent(e.id, { completed: !e.completed }), [updateEvent])
  const goTo = useCallback((e: CalendarEvent) => { setSelectedDate(e.date); setViewMode('day'); setActiveTab('calendar') }, [setSelectedDate, setViewMode, setActiveTab])

  return (
    <div className="flex flex-col gap-4 px-5 pt-4 pb-5">
      {/* Notification hint */}
      {!notifOK && (
        <div className="flex items-start gap-2.5 input-bg rounded-xl px-4 py-3">
          <svg className="w-4 h-4 text-apple-orange flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
          <p className="text-[12px] text-apple-orange leading-relaxed">请允许通知权限并允许浏览器后台运行，以确保提醒正常。</p>
        </div>
      )}

      {/* Overdue banner */}
      {overdueEvents.length > 0 && (
        <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255,149,0,0.08)' }}>
          <button onClick={() => setOverdueOpen(!overdueOpen)}
            className="w-full flex items-center gap-3 px-4 py-3 active:opacity-70 transition-opacity">
            <GradIcon gradient="grad-orange" size="sm">
              <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </GradIcon>
            <span className="flex-1 text-left text-[14px] font-semibold text-apple-orange">
              {overdueEvents.length} 项过期未完成
            </span>
            <svg className={`w-4 h-4 text-apple-orange transition-transform duration-200 ${overdueOpen ? 'rotate-180' : ''}`}
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {overdueOpen && overdueEvents.map((e) => (
            <EventRow key={e.id} event={e} overdue onToggle={() => toggle(e)} onTap={() => goTo(e)} />
          ))}
        </div>
      )}

      {/* Today header */}
      <div className="flex items-end justify-between">
        <div>
          <p className="text-[28px] font-bold text-apple-label leading-tight tracking-tight">{format(todayDate, 'M月d日')}</p>
          <p className="text-[15px] text-apple-label-secondary mt-0.5">{format(todayDate, 'EEEE', { locale: zhCN })}</p>
        </div>
        {todayEvents.length > 0 && (
          <div className="text-right">
            <p className="text-[22px] font-bold text-apple-label tabular-nums leading-none">
              {done}<span className="text-[16px] text-apple-label-tertiary">/{todayEvents.length}</span>
            </p>
            <p className="text-[11px] text-apple-label-tertiary mt-0.5">已完成</p>
          </div>
        )}
      </div>

      {/* Today periods */}
      {todayEvents.length === 0 ? (
        <EmptyState
          icon={<span className="text-[28px]">☕️</span>}
          title="今天没有安排"
          subtitle="好好休息吧~"
        />
      ) : (
        <div className="flex flex-col gap-2">
          {PERIODS.map((p) => {
            const items = byPeriod[p.key]
            if (items.length === 0) return null
            return (
              <div key={p.key} className="card overflow-hidden">
                <div className="flex items-center gap-2 px-4 pt-3.5 pb-1.5">
                  <span className="text-[15px]">{p.icon}</span>
                  <span className="text-[13px] font-semibold text-apple-label-secondary">{p.label}</span>
                  <span className="ml-auto text-[12px] text-apple-label-tertiary tabular-nums">
                    {items.filter((e) => e.completed).length}/{items.length}
                  </span>
                </div>
                {items.map((e, idx) => (
                  <div key={e.id}>
                    {idx > 0 && <div className="sep ml-14 mr-4" />}
                    <EventRow event={e} overdue={isOverdue(e, today)} onToggle={() => toggle(e)} onTap={() => goTo(e)} />
                  </div>
                ))}
              </div>
            )
          })}
        </div>
      )}

      {/* Upcoming 7 days */}
      {upcoming.length > 0 && (
        <div>
          <SectionTitle>接下来 7 天</SectionTitle>
          <div className="flex flex-col gap-2">
            {upcoming.map((g) => (
              <div key={g.date} className="card overflow-hidden">
                <p className="px-4 pt-3.5 pb-1.5 text-[13px] font-semibold text-apple-label">{g.label}</p>
                {g.events.map((e, idx) => (
                  <div key={e.id}>
                    {idx > 0 && <div className="sep ml-14 mr-4" />}
                    <EventRow event={e} onToggle={() => toggle(e)} onTap={() => goTo(e)} />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
