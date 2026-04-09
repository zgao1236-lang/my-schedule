import { useState, useCallback, useRef } from 'react'
import { useNoteStore, DEFAULT_FOLDER_ID } from '../../stores/useNoteStore'
import type { Folder } from '../../types'

// --- Action Menu (bottom sheet style) ---
function ActionMenu({ folder, onClose }: {
  folder: Folder
  onClose: () => void
}) {
  const { updateFolder, deleteFolder } = useNoteStore()
  const [mode, setMode] = useState<'menu' | 'rename' | 'confirmDelete'>('menu')
  const [name, setName] = useState(folder.name)

  const handleRename = async () => {
    if (name.trim()) {
      await updateFolder(folder.id, { name: name.trim() })
    }
    onClose()
  }

  const handleDelete = async () => {
    await deleteFolder(folder.id)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/30" />
      <div
        className="relative w-full max-w-[430px] bg-apple-card rounded-t-2xl sheet-enter"
        onClick={(e) => e.stopPropagation()}
        style={{ paddingBottom: 'calc(var(--safe-area-bottom, 0px) + 12px)' }}
      >
        <div className="flex justify-center pt-2 pb-1">
          <div className="w-9 h-[5px] rounded-full bg-apple-label-tertiary/30" />
        </div>

        {mode === 'menu' && (
          <div className="px-4 pb-2">
            <p className="text-[13px] text-apple-label-tertiary text-center mb-3">{folder.name}</p>
            <button
              onClick={() => setMode('rename')}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl active:input-bg transition-colors"
            >
              <svg className="w-5 h-5 text-apple-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
              </svg>
              <span className="text-[15px] text-apple-label">重命名</span>
            </button>
            <button
              onClick={() => setMode('confirmDelete')}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl active:input-bg transition-colors"
            >
              <svg className="w-5 h-5 text-apple-red" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
              </svg>
              <span className="text-[15px] text-apple-red">删除文件夹</span>
            </button>
          </div>
        )}

        {mode === 'rename' && (
          <div className="px-4 pb-2">
            <p className="text-[15px] font-semibold text-apple-label text-center mb-3">重命名</p>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
              className="w-full input-bg rounded-xl px-4 py-3 text-[15px] text-apple-label focus:outline-none focus:ring-2 focus:ring-apple-blue mb-3"
              onKeyDown={(e) => e.key === 'Enter' && handleRename()}
            />
            <div className="flex gap-2">
              <button onClick={onClose} className="flex-1 py-3 rounded-xl input-bg text-[15px] text-apple-label active:opacity-60">
                取消
              </button>
              <button onClick={handleRename} className="flex-1 py-3 rounded-xl bg-apple-blue text-[15px] text-white font-medium active:opacity-80">
                确认
              </button>
            </div>
          </div>
        )}

        {mode === 'confirmDelete' && (
          <div className="px-4 pb-2">
            <p className="text-[15px] font-semibold text-apple-label text-center mb-1">删除「{folder.name}」？</p>
            <p className="text-[13px] text-apple-label-tertiary text-center mb-4">文件夹及所有记录将被永久删除</p>
            <div className="flex gap-2">
              <button onClick={onClose} className="flex-1 py-3 rounded-xl input-bg text-[15px] text-apple-label active:opacity-60">
                取消
              </button>
              <button onClick={handleDelete} className="flex-1 py-3 rounded-xl bg-apple-red text-[15px] text-white font-medium active:opacity-80">
                删除
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
        .sheet-enter { animation: slideUp 0.32s cubic-bezier(0.32, 0.72, 0, 1); }
      `}</style>
    </div>
  )
}

// --- Create Folder Dialog ---
function CreateFolderDialog({ parentId, onClose }: {
  parentId: string | null
  onClose: () => void
}) {
  const [name, setName] = useState('')
  const { addFolder } = useNoteStore()

  const handleCreate = async () => {
    if (!name.trim()) return
    await addFolder(name.trim(), parentId)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-8" onClick={onClose}>
      <div className="absolute inset-0 bg-black/30" />
      <div
        className="relative w-full max-w-[320px] card p-5 card-elevated"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-[15px] font-semibold text-apple-label text-center mb-1">
          {parentId ? '新建子文件夹' : '新建文件夹'}
        </p>
        <p className="text-[13px] text-apple-label-tertiary text-center mb-4">输入文件夹名称</p>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="文件夹名称"
          autoFocus
          className="w-full input-bg rounded-xl px-4 py-3 text-[15px] text-apple-label placeholder:text-apple-label-tertiary focus:outline-none focus:ring-2 focus:ring-apple-blue mb-4"
          onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
        />
        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl input-bg text-[15px] text-apple-label active:opacity-60">
            取消
          </button>
          <button
            onClick={handleCreate}
            disabled={!name.trim()}
            className={`flex-1 py-2.5 rounded-xl text-[15px] font-medium active:opacity-80 ${name.trim() ? 'bg-apple-blue text-white' : 'input-bg text-apple-label-tertiary'}`}
          >
            创建
          </button>
        </div>
      </div>
    </div>
  )
}

// --- Folder Row ---
function FolderRow({ folder, noteCount, isDefault, isSubFolder, onOpen, onAction, onDragStart, onDragOver, onDrop }: {
  folder: Folder
  noteCount: number
  isDefault: boolean
  isSubFolder?: boolean
  onOpen: () => void
  onAction: () => void
  onDragStart: () => void
  onDragOver: (e: React.DragEvent) => void
  onDrop: () => void
}) {
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [pressing, setPressing] = useState(false)

  const handleTouchStart = () => {
    if (isDefault) return
    setPressing(true)
    longPressTimer.current = setTimeout(() => {
      onAction()
      setPressing(false)
    }, 500)
  }
  const handleTouchEnd = () => {
    if (longPressTimer.current) clearTimeout(longPressTimer.current)
    setPressing(false)
  }

  return (
    <div
      draggable={!isDefault}
      onDragStart={onDragStart}
      onDragOver={(e) => { e.preventDefault(); onDragOver(e) }}
      onDrop={onDrop}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
      onContextMenu={(e) => { if (!isDefault) { e.preventDefault(); onAction() } }}
      className={`flex items-center gap-3 px-4 py-3 press cursor-pointer transition-opacity ${
        pressing ? 'opacity-60' : ''
      } ${isSubFolder ? 'pl-12' : ''}`}
      onClick={onOpen}
    >
      <div className={`${isSubFolder ? 'w-8 h-8' : 'w-9 h-9'} rounded-[8px] flex items-center justify-center flex-shrink-0 ${
        isDefault ? 'bg-apple-label-tertiary/10' : isSubFolder ? 'bg-apple-indigo/10' : 'bg-apple-blue/10'
      }`}>
        <svg className={`${isSubFolder ? 'w-4 h-4' : 'w-[18px] h-[18px]'} ${
          isDefault ? 'text-apple-label-tertiary' : isSubFolder ? 'text-apple-indigo' : 'text-apple-blue'
        }`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
        </svg>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[15px] font-medium text-apple-label truncate">{folder.name}</p>
      </div>
      <span className="text-[14px] text-apple-label-tertiary tabular-nums mr-1">{noteCount}</span>
      <svg className="w-4 h-4 text-apple-label-tertiary/50 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
      </svg>
    </div>
  )
}

// --- Main Component ---
export function FolderListPage() {
  const { folders, notes, setActiveFolderId } = useNoteStore()
  const [menuFolder, setMenuFolder] = useState<Folder | null>(null)
  const [createParent, setCreateParent] = useState<string | null | undefined>(undefined) // undefined = closed
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set())
  const [dragId, setDragId] = useState<string | null>(null)
  const { reorderFolders } = useNoteStore()

  const rootFolders = folders.filter((f) => !f.parentId).sort((a, b) => a.order - b.order)
  const totalNotes = notes.length

  const toggleCollapse = useCallback((id: string) => {
    setCollapsed((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const handleDrop = useCallback((targetId: string) => {
    if (!dragId || dragId === targetId) return
    const ids = rootFolders.map((f) => f.id)
    const fromIdx = ids.indexOf(dragId)
    const toIdx = ids.indexOf(targetId)
    if (fromIdx < 0 || toIdx < 0) return
    ids.splice(fromIdx, 1)
    ids.splice(toIdx, 0, dragId)
    reorderFolders(ids)
    setDragId(null)
  }, [dragId, rootFolders, reorderFolders])

  return (
    <div className="flex flex-col gap-3 px-4 pt-3 pb-4">
      {/* Summary */}
      <div className="card p-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-[12px] grad-orange flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-[11px] font-semibold text-apple-label-secondary uppercase tracking-wide">全部记事</p>
            <p className="text-[28px] font-bold text-apple-label tracking-tight leading-tight">{totalNotes}</p>
          </div>
          <button
            onClick={() => setCreateParent(null)}
            className="w-9 h-9 rounded-full bg-apple-blue flex items-center justify-center active:opacity-70 transition-opacity"
          >
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          </button>
        </div>
      </div>

      {/* Folders */}
      <div>
        <h3 className="text-[13px] font-semibold text-apple-label-secondary uppercase tracking-wide mb-2 px-1">
          文件夹
        </h3>

        <div className="card overflow-hidden">
          {rootFolders.map((folder, idx) => {
            const isDefault = folder.id === DEFAULT_FOLDER_ID
            const folderNoteCount = notes.filter((n) => n.folderId === folder.id).length
            const subFolders = folders.filter((f) => f.parentId === folder.id).sort((a, b) => a.order - b.order)
            const isCollapsed = collapsed.has(folder.id)

            return (
              <div key={folder.id}>
                {idx > 0 && <div className="ml-16 mr-4 h-px bg-apple-separator" />}
                <div className="flex items-center">
                  {/* Collapse toggle for folders with children */}
                  {subFolders.length > 0 ? (
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleCollapse(folder.id) }}
                      className="pl-3 pr-0 py-3 flex-shrink-0 active:opacity-50"
                    >
                      <svg
                        className={`w-3.5 h-3.5 text-apple-label-tertiary transition-transform duration-200 ${isCollapsed ? '' : 'rotate-90'}`}
                        fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                      </svg>
                    </button>
                  ) : null}
                  <div className={`flex-1 ${subFolders.length > 0 ? '' : ''}`}>
                    <FolderRow
                      folder={folder}
                      noteCount={folderNoteCount}
                      isDefault={isDefault}
                      onOpen={() => setActiveFolderId(folder.id)}
                      onAction={() => setMenuFolder(folder)}
                      onDragStart={() => setDragId(folder.id)}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={() => handleDrop(folder.id)}
                    />
                  </div>
                </div>

                {/* Sub-folders */}
                {!isCollapsed && subFolders.map((sub) => {
                  const subNoteCount = notes.filter((n) => n.folderId === sub.id).length
                  return (
                    <div key={sub.id}>
                      <div className="ml-16 mr-4 h-px bg-apple-separator" />
                      <FolderRow
                        folder={sub}
                        noteCount={subNoteCount}
                        isDefault={false}
                        isSubFolder
                        onOpen={() => setActiveFolderId(sub.id)}
                        onAction={() => setMenuFolder(sub)}
                        onDragStart={() => {}}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={() => {}}
                      />
                    </div>
                  )
                })}

                {/* Add sub-folder button */}
                {!isCollapsed && !isDefault && (
                  <>
                    <div className="ml-16 mr-4 h-px bg-apple-separator" />
                    <button
                      onClick={() => setCreateParent(folder.id)}
                      className="flex items-center gap-2 pl-12 pr-4 py-2.5 w-full text-apple-blue active:input-bg transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                      </svg>
                      <span className="text-[13px] font-medium">添加子文件夹</span>
                    </button>
                  </>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Modals */}
      {menuFolder && <ActionMenu folder={menuFolder} onClose={() => setMenuFolder(null)} />}
      {createParent !== undefined && (
        <CreateFolderDialog parentId={createParent} onClose={() => setCreateParent(undefined)} />
      )}
    </div>
  )
}
