import { useState, useEffect, useCallback } from 'react'
import { useCalendarStore } from '../../stores/useCalendarStore'
import { useEventStore } from '../../stores/useEventStore'
import { getPeriodFromTime, todayStr } from '../../utils/date'
import { PRESET_COLORS, REMINDER_OPTIONS } from '../../types'
import type { Period } from '../../types'

const PERIODS: { value: Period; label: string; icon: string }[] = [
  { value: 'morning', label: '上午', icon: '🌅' },
  { value: 'afternoon', label: '下午', icon: '☀️' },
  { value: 'evening', label: '晚上', icon: '🌙' },
]

export function EventModal() {
  const { modalOpen, editingEvent, modalDefaultDate, modalDefaultPeriod, closeModal } = useCalendarStore()
  const { addEvent, updateEvent, deleteEvent } = useEventStore()

  const [title, setTitle] = useState('')
  const [date, setDate] = useState(todayStr())
  const [startTime, setStartTime] = useState('09:00')
  const [endTime, setEndTime] = useState('10:00')
  const [period, setPeriod] = useState<Period>('morning')
  const [color, setColor] = useState(PRESET_COLORS[0])
  const [description, setDescription] = useState('')
  const [reminderMinutes, setReminderMinutes] = useState<number | null>(null)
  const [closing, setClosing] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  useEffect(() => {
    if (!modalOpen) return
    setClosing(false)
    setConfirmDelete(false)
    if (editingEvent) {
      setTitle(editingEvent.title); setDate(editingEvent.date)
      setStartTime(editingEvent.startTime); setEndTime(editingEvent.endTime)
      setPeriod(editingEvent.period); setColor(editingEvent.color)
      setDescription(editingEvent.description)
      setReminderMinutes(editingEvent.reminder?.minutesBefore ?? null)
    } else {
      setTitle(''); setDate(modalDefaultDate || todayStr())
      const s = modalDefaultPeriod === 'afternoon' ? '13:00' : modalDefaultPeriod === 'evening' ? '19:00' : '09:00'
      const e = modalDefaultPeriod === 'afternoon' ? '14:00' : modalDefaultPeriod === 'evening' ? '20:00' : '10:00'
      setStartTime(s); setEndTime(e)
      setPeriod(modalDefaultPeriod || 'morning'); setColor(PRESET_COLORS[0])
      setDescription(''); setReminderMinutes(null)
    }
  }, [modalOpen, editingEvent, modalDefaultDate, modalDefaultPeriod])

  useEffect(() => { setPeriod(getPeriodFromTime(startTime)) }, [startTime])

  const handleClose = useCallback(() => {
    setClosing(true); setTimeout(closeModal, 300)
  }, [closeModal])

  const handleSave = useCallback(async () => {
    if (!title.trim()) return
    const data = {
      title: title.trim(), description, date, startTime, endTime, period,
      completed: editingEvent?.completed ?? false, color,
      repeat: editingEvent?.repeat ?? null, repeatGroupId: editingEvent?.repeatGroupId ?? null,
      isRepeatException: editingEvent?.isRepeatException ?? false,
      reminder: reminderMinutes != null ? { minutesBefore: reminderMinutes } : null,
      reminded: editingEvent?.reminded ?? false,
    }
    if (editingEvent) await updateEvent(editingEvent.id, data)
    else await addEvent(data)
    handleClose()
  }, [title, description, date, startTime, endTime, period, color, reminderMinutes, editingEvent, addEvent, updateEvent, handleClose])

  const handleDelete = useCallback(async () => {
    if (!editingEvent) return
    if (!confirmDelete) { setConfirmDelete(true); return }
    await deleteEvent(editingEvent.id); handleClose()
  }, [editingEvent, confirmDelete, deleteEvent, handleClose])

  if (!modalOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className={`absolute inset-0 bg-black/25 transition-opacity duration-300 ${closing ? 'opacity-0' : ''}`} onClick={handleClose} />
      <div className={`relative w-full max-w-[430px] bg-apple-card rounded-t-2xl max-h-[90dvh] flex flex-col transition-transform duration-300 ease-out ${closing ? 'translate-y-full' : 'sheet-enter'}`}
        style={{ paddingBottom: 'var(--safe-area-bottom, 0px)' }}>

        {/* Handle */}
        <div className="flex justify-center pt-2 pb-1">
          <div className="w-9 h-[5px] rounded-full bg-apple-label-tertiary/25" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 pb-3">
          <button onClick={handleClose} className="text-[15px] text-apple-blue min-w-[44px] min-h-[44px] flex items-center active:opacity-50">取消</button>
          <h2 className="text-[15px] font-semibold text-apple-label">{editingEvent ? '编辑日程' : '新建日程'}</h2>
          <button onClick={handleSave} disabled={!title.trim()}
            className={`text-[15px] font-semibold min-w-[44px] min-h-[44px] flex items-center justify-end active:opacity-50 ${title.trim() ? 'text-apple-blue' : 'text-apple-label-tertiary'}`}>
            保存
          </button>
        </div>
        <div className="sep mx-5" />

        {/* Form */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          <div className="flex flex-col gap-3">
            {/* Title */}
            <div className="input-bg rounded-xl px-4 py-3.5">
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="标题" autoFocus
                className="w-full text-[17px] text-apple-label placeholder:text-apple-label-tertiary bg-transparent focus:outline-none" />
            </div>

            {/* Date & Time */}
            <div className="input-bg rounded-xl overflow-hidden">
              <Row label="日期"><input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="form-val" /></Row>
              <div className="sep ml-4" />
              <Row label="开始"><input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="form-val" /></Row>
              <div className="sep ml-4" />
              <Row label="结束"><input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="form-val" /></Row>
              <div className="sep ml-4" />
              <div className="flex items-center justify-between px-4 py-3">
                <span className="text-[15px] text-apple-label">时段</span>
                <div className="flex gap-1">
                  {PERIODS.map((p) => (
                    <button key={p.value} onClick={() => setPeriod(p.value)}
                      className={`px-3 py-1.5 rounded-lg text-[13px] font-medium transition-colors ${
                        period === p.value ? 'bg-apple-blue text-white' : 'bg-apple-card text-apple-label-secondary'
                      }`}>
                      {p.icon} {p.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Color */}
            <div className="input-bg rounded-xl px-4 py-3.5">
              <div className="flex items-center justify-between">
                <span className="text-[15px] text-apple-label">颜色</span>
                <div className="flex gap-3">
                  {PRESET_COLORS.map((c) => (
                    <button key={c} onClick={() => setColor(c)}
                      className="relative w-7 h-7 rounded-full active:scale-90 transition-transform"
                      style={{ backgroundColor: c }}>
                      {color === c && (
                        <svg className="absolute inset-0 m-auto w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Reminder */}
            <div className="input-bg rounded-xl px-4 py-3.5">
              <Row label="提醒">
                <select value={reminderMinutes ?? ''} onChange={(e) => setReminderMinutes(e.target.value === '' ? null : Number(e.target.value))}
                  className="form-val appearance-none">
                  {REMINDER_OPTIONS.map((o) => <option key={o.label} value={o.value ?? ''}>{o.label}</option>)}
                </select>
              </Row>
            </div>

            {/* Repeat placeholder */}
            <div className="input-bg rounded-xl px-4 py-3.5 flex items-center justify-between">
              <span className="text-[15px] text-apple-label">重复</span>
              <span className="text-[15px] text-apple-label-tertiary flex items-center gap-1">
                不重复
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
              </span>
            </div>

            {/* Description */}
            <div className="input-bg rounded-xl px-4 py-3.5">
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="描述（可选）" rows={3}
                className="w-full text-[15px] text-apple-label placeholder:text-apple-label-tertiary bg-transparent focus:outline-none resize-none" />
            </div>

            {/* Delete */}
            {editingEvent && (
              <button onClick={handleDelete}
                className={`w-full py-3.5 rounded-xl text-[15px] font-medium transition-colors ${
                  confirmDelete ? 'bg-apple-red text-white' : 'input-bg text-apple-red'
                }`}>
                {confirmDelete ? '确认删除' : '删除日程'}
              </button>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .form-val { font-size: 15px; color: var(--color-apple-blue, #007AFF); background: transparent; text-align: right; outline: none; }
      `}</style>
    </div>
  )
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between px-4 py-3">
      <span className="text-[15px] text-apple-label">{label}</span>
      {children}
    </div>
  )
}
