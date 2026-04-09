import { useEffect, useRef, useState, useCallback } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import { TextStyle, FontSize } from '@tiptap/extension-text-style'
import Color from '@tiptap/extension-color'
import { EditorToolbar } from './EditorToolbar'
import { useNoteStore } from '../../stores/useNoteStore'

type SaveStatus = 'saved' | 'saving' | 'unsaved'

export function NoteEditorPage() {
  const { activeNoteId, notes, setActiveNoteId, setActiveFolderId, updateNote } = useNoteStore()
  const note = notes.find((n) => n.id === activeNoteId)

  const [saveStatus, setSaveStatus] = useState<SaveStatus>('saved')
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isDirty = useRef(false)
  const latestContent = useRef(note?.content || '')

  const doSave = useCallback(async () => {
    if (!activeNoteId || !isDirty.current) return
    setSaveStatus('saving')
    const content = latestContent.current
    const text = content.replace(/<[^>]*>/g, '').trim()
    const title = text.split('\n')[0]?.slice(0, 30) || ''
    await updateNote(activeNoteId, { content, title })
    isDirty.current = false
    setSaveStatus('saved')
  }, [activeNoteId, updateNote])

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
      }),
      Underline,
      TextStyle,
      Color,
      FontSize,
    ],
    content: note?.content || '',
    onUpdate: ({ editor }) => {
      const html = editor.getHTML()
      latestContent.current = html
      isDirty.current = true
      setSaveStatus('unsaved')

      if (debounceTimer.current) clearTimeout(debounceTimer.current)
      debounceTimer.current = setTimeout(() => {
        doSave()
      }, 2000)
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none min-h-[200px] px-4 py-3 text-[15px] leading-relaxed text-apple-label',
      },
    },
  })

  // Sync editor content when note changes externally
  useEffect(() => {
    if (editor && note && !isDirty.current) {
      if (editor.getHTML() !== note.content) {
        editor.commands.setContent(note.content || '')
      }
    }
  }, [editor, note])

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current)
    }
  }, [])

  const handleBack = useCallback(() => {
    if (isDirty.current) {
      // Save before leaving
      if (debounceTimer.current) clearTimeout(debounceTimer.current)
      doSave().then(() => {
        setActiveNoteId(null)
      })
    } else {
      setActiveNoteId(null)
    }
  }, [doSave, setActiveNoteId])

  const handleManualSave = useCallback(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current)
    doSave()
  }, [doSave])

  if (!note) {
    return (
      <div className="p-8 text-center text-apple-label-tertiary">
        <p>记录不存在</p>
        <button onClick={() => setActiveFolderId(null)} className="text-apple-blue mt-2">返回</button>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Header */}
      <div className="flex items-center gap-2 px-3 pt-2 pb-1.5 flex-shrink-0">
        <button
          onClick={handleBack}
          className="flex items-center gap-0.5 text-apple-blue active:opacity-50 transition-opacity"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          <span className="text-[15px]">返回</span>
        </button>

        <div className="flex-1 flex justify-center">
          <span className={`text-[12px] font-medium px-2 py-0.5 rounded-full transition-colors ${
            saveStatus === 'saved' ? 'text-apple-green bg-apple-green/10' :
            saveStatus === 'saving' ? 'text-apple-orange bg-apple-orange/10' :
            'text-apple-label-tertiary bg-apple-bg'
          }`}>
            {saveStatus === 'saved' ? '已保存' : saveStatus === 'saving' ? '保存中...' : '未保存更改'}
          </span>
        </div>

        <button
          onClick={handleManualSave}
          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
            isDirty.current ? 'text-apple-blue active:bg-apple-bg' : 'text-apple-label-tertiary'
          }`}
        >
          <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 3.75H6.912a2.25 2.25 0 00-2.15 1.588L2.35 13.177a2.25 2.25 0 00-.1.661V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18v-4.162c0-.224-.034-.447-.1-.661L19.24 5.338a2.25 2.25 0 00-2.15-1.588H15M2.25 13.5h3.86a2.25 2.25 0 012.012 1.244l.256.512a2.25 2.25 0 002.013 1.244h3.218a2.25 2.25 0 002.013-1.244l.256-.512a2.25 2.25 0 012.013-1.244h3.859" />
          </svg>
        </button>
      </div>

      {/* Toolbar */}
      <EditorToolbar editor={editor} />

      {/* Editor */}
      <div className="flex-1 overflow-y-auto bg-apple-card">
        <EditorContent editor={editor} />
      </div>

      {/* Tiptap editor styles */}
      <style>{`
        .ProseMirror {
          min-height: 300px;
          padding: 12px 16px;
          font-size: 15px;
          line-height: 1.7;
          color: var(--c-label);
        }
        .ProseMirror p {
          margin: 0 0 4px;
        }
        .ProseMirror ul, .ProseMirror ol {
          padding-left: 24px;
          margin: 4px 0;
        }
        .ProseMirror li {
          margin: 2px 0;
        }
        .ProseMirror li p {
          margin: 0;
        }
        .ProseMirror:focus {
          outline: none;
        }
        .ProseMirror p.is-editor-empty:first-child::before {
          content: '开始输入...';
          color: var(--c-label-tertiary);
          float: left;
          pointer-events: none;
          height: 0;
        }
      `}</style>
    </div>
  )
}
