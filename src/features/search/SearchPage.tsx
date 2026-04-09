import { useState, useMemo, useEffect, useRef, useCallback } from 'react'
import { format } from 'date-fns'
import { useEventStore } from '../../stores/useEventStore'
import { useNoteStore } from '../../stores/useNoteStore'
import { useCalendarStore } from '../../stores/useCalendarStore'
import { useAppStore } from '../../stores/useAppStore'
import { EmptyState, SectionTitle, Badge } from '../../components/ui'
import { ExportPanel } from './ExportPanel'
import type { CalendarEvent, Note } from '../../types'

type StatusFilter = 'all' | 'completed' | 'incomplete'
type TypeFilter = 'all' | 'events' | 'notes'
type RepeatFilter = 'all' | 'repeat' | 'no-repeat'

function Highlight({ text, query }: { text: string; query: string }) {
  if (!query.trim()) return <>{text}</>
  const re = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
  return <>{text.split(re).map((p, i) => re.test(p) ? <mark key={i} className="bg-yellow-300/40 text-inherit rounded-sm px-px">{p}</mark> : <span key={i}>{p}</span>)}</>
}

function strip(html: string) { return html.replace(/<[^>]*>/g, '').trim() }

function Chip({ label, on, onClick }: { label: string; on: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-[12px] font-semibold transition-colors whitespace-nowrap ${
        on ? 'bg-apple-blue text-white' : 'input-bg text-apple-label-secondary'
      }`}>
      {label}
    </button>
  )
}

export function SearchPage() {
  const [input, setInput] = useState('')
  const [query, setQuery] = useState('')
  const [focused, setFocused] = useState(false)
  const [showExport, setShowExport] = useState(false)
  const ref = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [status, setStatus] = useState<StatusFilter>('all')
  const [type, setType] = useState<TypeFilter>('all')
  const [repeat, setRepeat] = useState<RepeatFilter>('all')

  const events = useEventStore((s) => s.events)
  const { notes, folders, setActiveFolderId, setActiveNoteId } = useNoteStore()
  const { setSelectedDate, setViewMode } = useCalendarStore()
  const setActiveTab = useAppStore((s) => s.setActiveTab)

  useEffect(() => {
    if (ref.current) clearTimeout(ref.current)
    ref.current = setTimeout(() => setQuery(input), 300)
    return () => { if (ref.current) clearTimeout(ref.current) }
  }, [input])

  const folderMap = useMemo(() => new Map(folders.map((f) => [f.id, f])), [folders])

  const results = useMemo(() => {
    const q = query.toLowerCase()
    if (!q) return { events: [], notes: [] }
    let ev: CalendarEvent[] = []
    let nt: Note[] = []
    if (type !== 'notes') {
      ev = events.filter((e) => {
        if (!e.title.toLowerCase().includes(q) && !e.description.toLowerCase().includes(q)) return false
        if (status === 'completed' && !e.completed) return false
        if (status === 'incomplete' && e.completed) return false
        if (repeat === 'repeat' && !e.repeat) return false
        if (repeat === 'no-repeat' && e.repeat) return false
        return true
      })
    }
    if (type !== 'events') {
      nt = notes.filter((n) => {
        const text = strip(n.content).toLowerCase()
        return n.title.toLowerCase().includes(q) || text.includes(q)
      })
    }
    return { events: ev, notes: nt }
  }, [query, events, notes, status, type, repeat])

  const hasQ = query.trim().length > 0
  const hasR = results.events.length > 0 || results.notes.length > 0

  const goEvent = useCallback((e: CalendarEvent) => { setSelectedDate(e.date); setViewMode('day'); setActiveTab('calendar') }, [setSelectedDate, setViewMode, setActiveTab])
  const goNote = useCallback((n: Note) => { setActiveFolderId(n.folderId); setActiveNoteId(n.id); setActiveTab('notes') }, [setActiveFolderId, setActiveNoteId, setActiveTab])

  return (
    <div className="flex flex-col gap-4 px-5 pt-4 pb-5">
      {/* Search bar */}
      <div className="flex items-center gap-2.5">
        <div className="flex-1 relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-apple-label-tertiary pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input type="text" value={input} onChange={(e) => setInput(e.target.value)}
            onFocus={() => setFocused(true)} onBlur={() => { if (!input) setFocused(false) }}
            placeholder="搜索日程、记事..."
            className="w-full pl-9 pr-8 py-2.5 input-bg rounded-xl text-[15px] text-apple-label placeholder:text-apple-label-tertiary focus:outline-none" />
          {input && (
            <button onClick={() => { setInput(''); setQuery('') }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] rounded-full bg-apple-label-tertiary/40 flex items-center justify-center">
              <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          )}
        </div>
        {focused && (
          <button onClick={() => { setInput(''); setQuery(''); setFocused(false) }} className="text-[15px] text-apple-blue active:opacity-50">取消</button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-1.5">
        <Chip label="全部" on={type === 'all'} onClick={() => setType('all')} />
        <Chip label="日程" on={type === 'events'} onClick={() => setType('events')} />
        <Chip label="记事" on={type === 'notes'} onClick={() => setType('notes')} />
        <div className="w-px h-5 bg-apple-separator self-center mx-1" />
        <Chip label="全部状态" on={status === 'all'} onClick={() => setStatus('all')} />
        <Chip label="已完成" on={status === 'completed'} onClick={() => setStatus('completed')} />
        <Chip label="未完成" on={status === 'incomplete'} onClick={() => setStatus('incomplete')} />
        {type !== 'notes' && (
          <>
            <div className="basis-full h-0" />
            <Chip label="全部" on={repeat === 'all'} onClick={() => setRepeat('all')} />
            <Chip label="仅重复" on={repeat === 'repeat'} onClick={() => setRepeat('repeat')} />
            <Chip label="非重复" on={repeat === 'no-repeat'} onClick={() => setRepeat('no-repeat')} />
          </>
        )}
      </div>

      {/* Results */}
      {!hasQ ? (
        <EmptyState
          icon={<svg className="w-8 h-8 text-apple-label-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg>}
          title="输入关键词搜索"
        />
      ) : !hasR ? (
        <EmptyState
          icon={<svg className="w-8 h-8 text-apple-label-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15.182 16.318A4.486 4.486 0 0012.016 15a4.486 4.486 0 00-3.198 1.318M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z" /></svg>}
          title="无结果"
          subtitle={`没有找到 "${query}" 的相关内容`}
        />
      ) : (
        <div className="flex flex-col gap-4">
          {results.events.length > 0 && (
            <div>
              <SectionTitle right={`${results.events.length} 条`}>日程</SectionTitle>
              <div className="card overflow-hidden">
                {results.events.map((e, idx, arr) => (
                  <div key={e.id}>
                    {idx > 0 && <div className="sep ml-4" />}
                    <div className="flex items-center gap-3 px-4 py-3 press" onClick={() => goEvent(e)}>
                      <div className="w-[3px] self-stretch rounded-full flex-shrink-0" style={{ backgroundColor: e.color }} />
                      <div className="flex-1 min-w-0">
                        <p className={`text-[15px] font-medium truncate ${e.completed ? 'line-through text-apple-label-tertiary' : 'text-apple-label'}`}>
                          <Highlight text={e.title} query={query} />
                        </p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[12px] text-apple-label-tertiary">{e.date} · {e.startTime}–{e.endTime}</span>
                          {e.repeat && <Badge color="#007AFF">重复</Badge>}
                        </div>
                        {e.description && <p className="text-[12px] text-apple-label-tertiary mt-0.5 truncate"><Highlight text={e.description.slice(0, 60)} query={query} /></p>}
                      </div>
                      <svg className="w-4 h-4 text-apple-label-tertiary/40 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {results.notes.length > 0 && (
            <div>
              <SectionTitle right={`${results.notes.length} 条`}>记事</SectionTitle>
              <div className="card overflow-hidden">
                {results.notes.map((n, idx) => {
                  const folder = folderMap.get(n.folderId)
                  const text = strip(n.content)
                  return (
                    <div key={n.id}>
                      {idx > 0 && <div className="sep ml-4" />}
                      <div className="px-4 py-3 press" onClick={() => goNote(n)}>
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className="text-[11px] text-apple-blue font-semibold">{folder?.name || '未分类'}</span>
                          <span className="text-[11px] text-apple-label-tertiary">· {format(n.updatedAt, 'yyyy/MM/dd')}</span>
                        </div>
                        <p className="text-[15px] font-medium text-apple-label truncate"><Highlight text={n.title || '无标题'} query={query} /></p>
                        {text && <p className="text-[13px] text-apple-label-tertiary mt-0.5 line-clamp-2 leading-relaxed"><Highlight text={text.slice(0, 100)} query={query} /></p>}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Export */}
      <button onClick={() => setShowExport(true)}
        className="card flex items-center justify-center gap-2.5 py-4 press">
        <svg className="w-5 h-5 text-apple-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
        </svg>
        <span className="text-[15px] font-medium text-apple-blue">数据导出与备份</span>
      </button>

      {showExport && <ExportPanel onClose={() => setShowExport(false)} />}
    </div>
  )
}
