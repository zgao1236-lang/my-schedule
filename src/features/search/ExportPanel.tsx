import { useState, useRef, useCallback } from 'react'
import { useEventStore } from '../../stores/useEventStore'
import { useNoteStore } from '../../stores/useNoteStore'
import {
  exportEventsCSV, exportEventsTXT, exportEventsMD,
  exportNotesTXT, exportNotesMD, exportNotesCSV,
  exportFullBackup, importFullBackup,
} from '../../utils/export'

type ExportContent = 'all-notes' | 'folder-notes' | 'all-events'
type ExportFormat = 'txt' | 'md' | 'csv'

export function ExportPanel({ onClose }: { onClose: () => void }) {
  const events = useEventStore((s) => s.events)
  const { folders, notes, loadFolders, loadNotes } = useNoteStore()
  const loadEvents = useEventStore((s) => s.loadEvents)

  const [content, setContent] = useState<ExportContent>('all-events')
  const [format, setFormat] = useState<ExportFormat>('csv')
  const [selectedFolderId, setSelectedFolderId] = useState<string>('')
  const [restoreConfirm, setRestoreConfirm] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [closing, setClosing] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleClose = useCallback(() => {
    setClosing(true)
    setTimeout(onClose, 280)
  }, [onClose])

  const handleExport = () => {
    if (content === 'all-events') {
      if (format === 'csv') exportEventsCSV(events)
      else if (format === 'txt') exportEventsTXT(events)
      else exportEventsMD(events)
    } else {
      const targetNotes = content === 'folder-notes' && selectedFolderId
        ? notes.filter((n) => n.folderId === selectedFolderId)
        : notes
      if (format === 'csv') exportNotesCSV(targetNotes, folders)
      else if (format === 'txt') exportNotesTXT(targetNotes, folders)
      else exportNotesMD(targetNotes, folders)
    }
    setMessage('导出成功')
    setTimeout(() => setMessage(null), 2000)
  }

  const handleBackup = async () => {
    await exportFullBackup()
    setMessage('备份已下载')
    setTimeout(() => setMessage(null), 2000)
  }

  const handleRestoreFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const result = await importFullBackup(file)
      await loadEvents()
      await loadFolders()
      await loadNotes()
      setMessage(`恢复成功：${result.events} 条日程、${result.folders} 个文件夹、${result.notes} 条记事`)
      setRestoreConfirm(false)
      setTimeout(() => setMessage(null), 4000)
    } catch {
      setMessage('恢复失败：文件格式无效')
      setTimeout(() => setMessage(null), 3000)
    }
    // Reset input
    e.target.value = ''
  }

  const rootFolders = folders.filter((f) => !f.parentId)
  const showFolderPicker = content === 'folder-notes'

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div
        className={`absolute inset-0 bg-black/30 transition-opacity duration-280 ${closing ? 'opacity-0' : 'opacity-100'}`}
        onClick={handleClose}
      />
      <div
        className={`relative w-full max-w-[430px] bg-apple-card rounded-t-[16px] max-h-[85dvh] flex flex-col transition-transform duration-280 ease-out ${closing ? 'translate-y-full' : 'sheet-enter'}`}
        style={{ paddingBottom: 'var(--safe-area-bottom, 0px)' }}
      >
        {/* Handle */}
        <div className="flex justify-center pt-2 pb-1">
          <div className="w-9 h-[5px] rounded-full bg-apple-label-tertiary/30" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-4 pb-2">
          <button onClick={handleClose} className="text-[15px] text-apple-blue active:opacity-50">关闭</button>
          <h2 className="text-[15px] font-semibold text-apple-label">数据管理</h2>
          <div className="w-10" />
        </div>
        <div className="h-px bg-apple-separator" />

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-4 py-3">
          {/* Toast */}
          {message && (
            <div className="mb-3 bg-apple-green/10 text-apple-green text-[13px] font-medium px-3 py-2 rounded-xl text-center">
              {message}
            </div>
          )}

          {/* === Export Section === */}
          <h3 className="text-[13px] font-semibold text-apple-label-secondary uppercase tracking-wide mb-2">导出数据</h3>

          {/* Content selection */}
          <div className="input-bg rounded-xl overflow-hidden mb-3">
            {([
              ['all-events', '所有日程事项'],
              ['all-notes', '所有记事本记录'],
              ['folder-notes', '选择文件夹的记录'],
            ] as const).map(([val, label], idx) => (
              <div key={val}>
                {idx > 0 && <div className="ml-4 h-px bg-apple-separator" />}
                <button
                  onClick={() => setContent(val)}
                  className="w-full flex items-center justify-between px-4 py-3 active:bg-apple-separator/50 transition-colors"
                >
                  <span className="text-[15px] text-apple-label">{label}</span>
                  {content === val && (
                    <svg className="w-5 h-5 text-apple-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  )}
                </button>
              </div>
            ))}
          </div>

          {/* Folder picker */}
          {showFolderPicker && (
            <div className="input-bg rounded-xl px-4 py-3 mb-3">
              <select
                value={selectedFolderId}
                onChange={(e) => setSelectedFolderId(e.target.value)}
                className="w-full text-[15px] text-apple-label bg-transparent focus:outline-none"
              >
                <option value="">选择文件夹...</option>
                {rootFolders.map((f) => (
                  <option key={f.id} value={f.id}>{f.name}</option>
                ))}
              </select>
            </div>
          )}

          {/* Format selection */}
          <div className="flex gap-2 mb-3">
            {(['csv', 'txt', 'md'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFormat(f)}
                className={`flex-1 py-2.5 rounded-xl text-[14px] font-medium transition-colors ${
                  format === f ? 'bg-apple-blue text-white' : 'input-bg text-apple-label-secondary'
                }`}
              >
                {f.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Export button */}
          <button
            onClick={handleExport}
            disabled={showFolderPicker && !selectedFolderId}
            className={`w-full py-3 rounded-xl text-[15px] font-semibold transition-colors mb-6 ${
              showFolderPicker && !selectedFolderId
                ? 'input-bg text-apple-label-tertiary'
                : 'bg-apple-blue text-white active:opacity-80'
            }`}
          >
            导出
          </button>

          {/* === Backup Section === */}
          <h3 className="text-[13px] font-semibold text-apple-label-secondary uppercase tracking-wide mb-2">备份与恢复</h3>

          <div className="flex gap-2 mb-3">
            <button
              onClick={handleBackup}
              className="flex-1 input-bg rounded-xl py-3 flex flex-col items-center gap-1 active:opacity-70 transition-opacity"
            >
              <svg className="w-6 h-6 text-apple-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
              <span className="text-[13px] font-medium text-apple-label">备份所有数据</span>
              <span className="text-[11px] text-apple-label-tertiary">导出 JSON 文件</span>
            </button>
            <button
              onClick={() => setRestoreConfirm(true)}
              className="flex-1 input-bg rounded-xl py-3 flex flex-col items-center gap-1 active:opacity-70 transition-opacity"
            >
              <svg className="w-6 h-6 text-apple-orange" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
              </svg>
              <span className="text-[13px] font-medium text-apple-label">恢复数据</span>
              <span className="text-[11px] text-apple-label-tertiary">导入 JSON 文件</span>
            </button>
          </div>

          {/* Restore confirmation */}
          {restoreConfirm && (
            <div className="bg-apple-red/8 border border-apple-red/15 rounded-xl px-4 py-3 mb-3">
              <p className="text-[13px] text-apple-red font-medium mb-1">⚠️ 恢复将覆盖所有现有数据</p>
              <p className="text-[12px] text-apple-label-secondary mb-3">建议先备份当前数据，再执行恢复操作。</p>
              <div className="flex gap-2">
                <button onClick={() => setRestoreConfirm(false)} className="flex-1 py-2 rounded-lg input-bg text-[13px] text-apple-label active:opacity-60">
                  取消
                </button>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 py-2 rounded-lg bg-apple-red text-[13px] text-white font-medium active:opacity-80"
                >
                  选择文件
                </button>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                className="hidden"
                onChange={handleRestoreFile}
              />
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
        .sheet-enter { animation: slideUp 0.32s cubic-bezier(0.32, 0.72, 0, 1); }
      `}</style>
    </div>
  )
}
