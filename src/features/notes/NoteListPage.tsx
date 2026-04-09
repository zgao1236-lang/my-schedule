import { useState, useMemo, useRef } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { useNoteStore } from '../../stores/useNoteStore'
import type { Note } from '../../types'

type SortMode = 'updatedAt' | 'createdAt'

function extractTitle(note: Note): string {
  if (note.title) return note.title
  const text = note.content.replace(/<[^>]*>/g, '').trim()
  return text.slice(0, 30) || '无标题'
}

function NoteRow({ note, onOpen, onDelete }: {
  note: Note
  onOpen: () => void
  onDelete: () => void
}) {
  const [swipeX, setSwipeX] = useState(0)
  const startX = useRef(0)
  const swiping = useRef(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const handleTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX
    swiping.current = false
  }
  const handleTouchMove = (e: React.TouchEvent) => {
    const dx = e.touches[0].clientX - startX.current
    if (dx < -10) swiping.current = true
    if (swiping.current) {
      setSwipeX(Math.min(0, Math.max(-80, dx)))
    }
  }
  const handleTouchEnd = () => {
    if (swipeX < -40) {
      setSwipeX(-80)
    } else {
      setSwipeX(0)
    }
  }

  const handleDelete = () => {
    if (!confirmDelete) {
      setConfirmDelete(true)
      return
    }
    onDelete()
  }

  const title = extractTitle(note)
  const preview = note.content.replace(/<[^>]*>/g, '').trim().slice(0, 60)
  const timeAgo = formatDistanceToNow(note.updatedAt, { addSuffix: true, locale: zhCN })

  return (
    <div className="relative overflow-hidden">
      {/* Delete action behind */}
      <div className="absolute right-0 top-0 bottom-0 w-20 flex items-center justify-center bg-apple-red">
        <button onClick={handleDelete} className="text-[13px] text-white font-medium w-full h-full">
          {confirmDelete ? '确认' : '删除'}
        </button>
      </div>

      {/* Card content */}
      <div
        className="relative bg-apple-card transition-transform duration-150 press"
        style={{ transform: `translateX(${swipeX}px)` }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={() => { if (!swiping.current && swipeX === 0) onOpen() }}
      >
        <div className="px-4 py-3">
          <p className="text-[15px] font-medium text-apple-label truncate">{title}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[12px] text-apple-label-tertiary flex-shrink-0">{timeAgo}</span>
            {preview && (
              <p className="text-[12px] text-apple-label-tertiary truncate">{preview}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export function NoteListPage() {
  const { activeFolderId, folders, notes, setActiveFolderId, setActiveNoteId, addNote } = useNoteStore()
  const [sortMode, setSortMode] = useState<SortMode>('updatedAt')

  const folder = folders.find((f) => f.id === activeFolderId)

  const folderNotes = useMemo(() => {
    const filtered = notes.filter((n) => n.folderId === activeFolderId)
    return [...filtered].sort((a, b) => b[sortMode] - a[sortMode])
  }, [notes, activeFolderId, sortMode])

  const handleNewNote = async () => {
    if (!activeFolderId) return
    const note = await addNote(activeFolderId, '', '')
    setActiveNoteId(note.id)
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-3 pb-2">
        <button
          onClick={() => setActiveFolderId(null)}
          className="flex items-center gap-1 text-apple-blue active:opacity-50 transition-opacity"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          <span className="text-[15px]">返回</span>
        </button>
        <h2 className="flex-1 text-[17px] font-semibold text-apple-label text-center truncate pr-8">
          {folder?.name || '记录'}
        </h2>
        <button
          onClick={handleNewNote}
          className="w-8 h-8 rounded-full bg-apple-blue flex items-center justify-center active:opacity-70 flex-shrink-0"
        >
          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
        </button>
      </div>

      {/* Sort toggle */}
      <div className="px-4 pb-2">
        <div className="flex input-bg rounded-lg p-[2px] w-fit">
          <button
            onClick={() => setSortMode('updatedAt')}
            className={`px-3 py-1 rounded-[6px] text-[12px] font-medium transition-all ${
              sortMode === 'updatedAt' ? 'bg-apple-card  text-apple-label' : 'text-apple-label-secondary'
            }`}
          >
            最近编辑
          </button>
          <button
            onClick={() => setSortMode('createdAt')}
            className={`px-3 py-1 rounded-[6px] text-[12px] font-medium transition-all ${
              sortMode === 'createdAt' ? 'bg-apple-card  text-apple-label' : 'text-apple-label-secondary'
            }`}
          >
            创建时间
          </button>
        </div>
      </div>

      {/* Notes list */}
      <div className="flex-1 px-4 pb-4">
        {folderNotes.length === 0 ? (
          <div className="card p-10 text-center">
            <div className="w-14 h-14 rounded-full input-bg mx-auto mb-3 flex items-center justify-center">
              <svg className="w-7 h-7 text-apple-label-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
            </div>
            <p className="text-[15px] font-medium text-apple-label-secondary">暂无记录</p>
            <p className="text-[13px] text-apple-label-tertiary mt-1">点击右上角 + 新建记录</p>
          </div>
        ) : (
          <div className="card overflow-hidden">
            {folderNotes.map((note, idx) => (
              <div key={note.id}>
                {idx > 0 && <div className="ml-4 mr-4 h-px bg-apple-separator" />}
                <NoteRow
                  note={note}
                  onOpen={() => setActiveNoteId(note.id)}
                  onDelete={() => useNoteStore.getState().deleteNote(note.id)}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
