import { create } from 'zustand'
import { v4 as uuid } from 'uuid'
import { db } from '../db'
import type { Folder, Note } from '../types'

export const DEFAULT_FOLDER_ID = '__uncategorized__'

interface NoteState {
  folders: Folder[]
  notes: Note[]
  loading: boolean
  // Navigation state within Notes tab
  activeFolderId: string | null
  activeNoteId: string | null

  loadFolders: () => Promise<void>
  loadNotes: () => Promise<void>
  ensureDefaultFolder: () => Promise<void>
  addFolder: (name: string, parentId?: string | null) => Promise<Folder>
  updateFolder: (id: string, updates: Partial<Folder>) => Promise<void>
  deleteFolder: (id: string) => Promise<void>
  reorderFolders: (orderedIds: string[]) => Promise<void>
  addNote: (folderId: string, title: string, content: string) => Promise<Note>
  updateNote: (id: string, updates: Partial<Note>) => Promise<void>
  deleteNote: (id: string) => Promise<void>
  setActiveFolderId: (id: string | null) => void
  setActiveNoteId: (id: string | null) => void
}

export const useNoteStore = create<NoteState>((set, get) => ({
  folders: [],
  notes: [],
  loading: false,
  activeFolderId: null,
  activeNoteId: null,

  loadFolders: async () => {
    const folders = await db.folders.orderBy('order').toArray()
    set({ folders })
  },

  loadNotes: async () => {
    set({ loading: true })
    const notes = await db.notes.toArray()
    set({ notes, loading: false })
  },

  ensureDefaultFolder: async () => {
    const exists = await db.folders.get(DEFAULT_FOLDER_ID)
    if (!exists) {
      const now = Date.now()
      const folder: Folder = {
        id: DEFAULT_FOLDER_ID,
        name: '未分类',
        parentId: null,
        order: -1,
        createdAt: now,
        updatedAt: now,
      }
      await db.folders.add(folder)
      set({ folders: [folder, ...get().folders] })
    }
  },

  addFolder: async (name, parentId = null) => {
    const now = Date.now()
    const maxOrder = get().folders.reduce((m, f) => Math.max(m, f.order), 0)
    const folder: Folder = {
      id: uuid(),
      name,
      parentId: parentId ?? null,
      order: maxOrder + 1,
      createdAt: now,
      updatedAt: now,
    }
    await db.folders.add(folder)
    set({ folders: [...get().folders, folder] })
    return folder
  },

  updateFolder: async (id, updates) => {
    const updatedData = { ...updates, updatedAt: Date.now() }
    await db.folders.update(id, updatedData)
    set({
      folders: get().folders.map((f) => (f.id === id ? { ...f, ...updatedData } : f)),
    })
  },

  deleteFolder: async (id) => {
    if (id === DEFAULT_FOLDER_ID) return
    // Delete sub-folders too
    const subIds = get().folders.filter((f) => f.parentId === id).map((f) => f.id)
    const allIds = [id, ...subIds]
    const notesToDelete = get().notes.filter((n) => allIds.includes(n.folderId))
    await db.notes.bulkDelete(notesToDelete.map((n) => n.id))
    await db.folders.bulkDelete(allIds)
    set({
      folders: get().folders.filter((f) => !allIds.includes(f.id)),
      notes: get().notes.filter((n) => !allIds.includes(n.folderId)),
    })
  },

  reorderFolders: async (orderedIds) => {
    const folders = get().folders.map((f) => {
      const idx = orderedIds.indexOf(f.id)
      return idx >= 0 ? { ...f, order: idx } : f
    })
    folders.sort((a, b) => a.order - b.order)
    set({ folders })
    // Persist
    for (const f of folders) {
      const idx = orderedIds.indexOf(f.id)
      if (idx >= 0) await db.folders.update(f.id, { order: idx })
    }
  },

  addNote: async (folderId, title, content) => {
    const now = Date.now()
    const note: Note = {
      id: uuid(),
      folderId,
      title,
      content,
      createdAt: now,
      updatedAt: now,
    }
    await db.notes.add(note)
    set({ notes: [...get().notes, note] })
    return note
  },

  updateNote: async (id, updates) => {
    const updatedData = { ...updates, updatedAt: Date.now() }
    await db.notes.update(id, updatedData)
    set({
      notes: get().notes.map((n) => (n.id === id ? { ...n, ...updatedData } : n)),
    })
  },

  deleteNote: async (id) => {
    await db.notes.delete(id)
    set({ notes: get().notes.filter((n) => n.id !== id) })
  },

  setActiveFolderId: (id) => set({ activeFolderId: id, activeNoteId: null }),
  setActiveNoteId: (id) => set({ activeNoteId: id }),
}))
