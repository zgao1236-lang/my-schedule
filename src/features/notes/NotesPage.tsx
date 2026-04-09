import { useNoteStore } from '../../stores/useNoteStore'
import { FolderListPage } from './FolderListPage'
import { NoteListPage } from './NoteListPage'
import { NoteEditorPage } from './NoteEditorPage'

export function NotesPage() {
  const activeFolderId = useNoteStore((s) => s.activeFolderId)
  const activeNoteId = useNoteStore((s) => s.activeNoteId)

  // 3-level navigation: Folders → Note List → Editor
  if (activeNoteId) {
    return <NoteEditorPage />
  }
  if (activeFolderId) {
    return <NoteListPage />
  }
  return <FolderListPage />
}
