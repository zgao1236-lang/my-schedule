import type { CalendarEvent } from '../types'

/* ── Empty State ── */
export function EmptyState({ icon, title, subtitle }: {
  icon: React.ReactNode
  title: string
  subtitle?: string
}) {
  return (
    <div className="card flex flex-col items-center py-16 px-6">
      <div className="w-16 h-16 rounded-full input-bg flex items-center justify-center mb-4">
        {icon}
      </div>
      <p className="text-[15px] font-medium text-apple-label-secondary">{title}</p>
      {subtitle && <p className="text-[13px] text-apple-label-tertiary mt-1 text-center">{subtitle}</p>}
    </div>
  )
}

/* ── Section Header ── */
export function SectionTitle({ children, right }: {
  children: React.ReactNode
  right?: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between px-1 mb-2">
      <h3 className="text-[13px] font-semibold text-apple-label-secondary uppercase tracking-wider">{children}</h3>
      {right && <span className="text-[12px] text-apple-label-tertiary">{right}</span>}
    </div>
  )
}

/* ── Nav Button (prev/next) ── */
export function NavButton({ direction, onClick }: {
  direction: 'left' | 'right'
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="w-10 h-10 flex items-center justify-center rounded-xl active:bg-apple-separator transition-colors"
    >
      <svg className="w-5 h-5 text-apple-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round"
          d={direction === 'left' ? 'M15 19l-7-7 7-7' : 'M9 5l7 7-7 7'} />
      </svg>
    </button>
  )
}

/* ── Check Circle ── */
export function CheckCircle({ checked, color, size = 22, onToggle }: {
  checked: boolean
  color: string
  size?: number
  onToggle: () => void
}) {
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onToggle() }}
      className="flex-shrink-0 rounded-full border-[1.5px] flex items-center justify-center transition-all"
      style={{
        width: size, height: size,
        borderColor: checked ? '#34C759' : color,
        backgroundColor: checked ? '#34C759' : 'transparent',
      }}
    >
      {checked && (
        <svg className="text-white" style={{ width: size * 0.5, height: size * 0.5 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
        </svg>
      )}
    </button>
  )
}

/* ── Event Row (shared across calendar, reminders, search) ── */
export function EventRow({ event, overdue, onToggle, onTap }: {
  event: CalendarEvent
  overdue?: boolean
  onToggle: () => void
  onTap: () => void
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 press" onClick={onTap}>
      <CheckCircle
        checked={event.completed}
        color={overdue ? '#FF3B30' : event.color}
        onToggle={onToggle}
      />
      <span className={`text-[13px] tabular-nums w-11 flex-shrink-0 ${
        overdue ? 'text-apple-red font-semibold' : 'text-apple-label-secondary'
      }`}>
        {event.startTime}
      </span>
      <span className={`flex-1 text-[15px] truncate ${
        event.completed ? 'line-through text-apple-label-tertiary'
          : overdue ? 'text-apple-red font-medium'
          : 'text-apple-label'
      }`}>
        {event.title}
      </span>
      <div className="w-[3px] h-6 rounded-full flex-shrink-0" style={{ backgroundColor: event.color }} />
    </div>
  )
}

/* ── Pill / Badge ── */
export function Badge({ children, color = '#007AFF' }: {
  children: React.ReactNode
  color?: string
}) {
  return (
    <span
      className="text-[11px] font-semibold px-2 py-0.5 rounded-md"
      style={{ backgroundColor: `${color}15`, color }}
    >
      {children}
    </span>
  )
}

/* ── Gradient Icon Circle ── */
export function GradIcon({ gradient, children, size = 'md' }: {
  gradient: string
  children: React.ReactNode
  size?: 'sm' | 'md'
}) {
  const cls = size === 'sm'
    ? 'w-7 h-7 rounded-lg'
    : 'w-11 h-11 rounded-[13px]'
  return (
    <div className={`${cls} ${gradient} flex items-center justify-center flex-shrink-0`}>
      {children}
    </div>
  )
}

/* ── Sheet (bottom modal wrapper) ── */
export function Sheet({ open, onClose, title, children }: {
  open: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
}) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-black/25" onClick={onClose} />
      <div
        className="relative w-full max-w-[430px] bg-apple-card rounded-t-2xl max-h-[88dvh] flex flex-col sheet-enter"
        style={{ paddingBottom: 'var(--safe-area-bottom, 0px)' }}
      >
        <div className="flex justify-center pt-2 pb-1">
          <div className="w-9 h-[5px] rounded-full bg-apple-label-tertiary/25" />
        </div>
        <div className="flex items-center justify-between px-5 pb-3">
          <button onClick={onClose} className="text-[15px] text-apple-blue active:opacity-50 transition-opacity min-w-[44px]">
            取消
          </button>
          <h2 className="text-[15px] font-semibold text-apple-label">{title}</h2>
          <div className="min-w-[44px]" />
        </div>
        <div className="sep mx-5" />
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  )
}
