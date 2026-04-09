import { useEffect } from 'react'
import { useEventStore } from '../stores/useEventStore'
import { useNoteStore } from '../stores/useNoteStore'

export function useInitData() {
  const loadEvents = useEventStore((s) => s.loadEvents)
  const loadFolders = useNoteStore((s) => s.loadFolders)
  const loadNotes = useNoteStore((s) => s.loadNotes)
  const ensureDefaultFolder = useNoteStore((s) => s.ensureDefaultFolder)

  useEffect(() => {
    loadEvents()
    ensureDefaultFolder().then(() => loadFolders())
    loadNotes()
  }, [loadEvents, loadFolders, loadNotes, ensureDefaultFolder])
}
