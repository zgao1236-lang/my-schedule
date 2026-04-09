import { useState } from 'react'
import type { Editor } from '@tiptap/react'

const TEXT_COLORS = ['#1C1C1E', '#FF3B30', '#007AFF', '#34C759', '#FF9500', '#AF52DE']

const FONT_SIZES = [
  { label: '小', value: '14px' },
  { label: '默认', value: '16px' },
  { label: '大', value: '20px' },
  { label: '特大', value: '24px' },
]

export function EditorToolbar({ editor }: { editor: Editor | null }) {
  const [showColors, setShowColors] = useState(false)
  const [showSize, setShowSize] = useState(false)

  if (!editor) return null

  const closePopups = () => { setShowColors(false); setShowSize(false) }

  return (
    <div className="relative flex items-center gap-[2px] px-2 py-1.5 bg-apple-card border-b border-apple-separator overflow-x-auto flex-shrink-0">
      {/* Bold */}
      <button
        onMouseDown={(e) => { e.preventDefault(); closePopups(); editor.chain().focus().toggleBold().run() }}
        className={`w-9 h-9 rounded-lg flex items-center justify-center text-[16px] font-bold transition-colors ${
          editor.isActive('bold') ? 'bg-apple-blue/10 text-apple-blue' : 'text-apple-label active:bg-apple-bg'
        }`}
      >
        B
      </button>

      {/* Italic */}
      <button
        onMouseDown={(e) => { e.preventDefault(); closePopups(); editor.chain().focus().toggleItalic().run() }}
        className={`w-9 h-9 rounded-lg flex items-center justify-center text-[16px] italic transition-colors ${
          editor.isActive('italic') ? 'bg-apple-blue/10 text-apple-blue' : 'text-apple-label active:bg-apple-bg'
        }`}
      >
        I
      </button>

      {/* Underline */}
      <button
        onMouseDown={(e) => { e.preventDefault(); closePopups(); editor.chain().focus().toggleUnderline().run() }}
        className={`w-9 h-9 rounded-lg flex items-center justify-center text-[16px] underline transition-colors ${
          editor.isActive('underline') ? 'bg-apple-blue/10 text-apple-blue' : 'text-apple-label active:bg-apple-bg'
        }`}
      >
        U
      </button>

      {/* Divider */}
      <div className="w-px h-5 bg-apple-separator mx-1" />

      {/* Color */}
      <div className="relative">
        <button
          onMouseDown={(e) => { e.preventDefault(); setShowSize(false); setShowColors(!showColors) }}
          className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${
            showColors ? 'bg-apple-blue/10' : 'active:bg-apple-bg'
          }`}
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
            <path d="M11 3L5.5 17h2.2l1.1-3h6.4l1.1 3h2.2L13 3h-2zm-.6 9L12 6.8 13.6 12H10.4z" fill={editor.getAttributes('textStyle').color || 'currentColor'} />
            <rect x="3" y="19" width="18" height="2.5" rx="1" fill={editor.getAttributes('textStyle').color || 'currentColor'} />
          </svg>
        </button>
        {showColors && (
          <div className="absolute top-full left-0 mt-1 card-sm card-elevated p-2 flex gap-2 z-10">
            {TEXT_COLORS.map((c) => (
              <button
                key={c}
                onMouseDown={(e) => {
                  e.preventDefault()
                  editor.chain().focus().setColor(c).run()
                  setShowColors(false)
                }}
                className="w-7 h-7 rounded-full border-2 border-transparent active:scale-90 transition-transform"
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Font Size */}
      <div className="relative">
        <button
          onMouseDown={(e) => { e.preventDefault(); setShowColors(false); setShowSize(!showSize) }}
          className={`h-9 px-2 rounded-lg flex items-center gap-1 text-[13px] font-medium transition-colors ${
            showSize ? 'bg-apple-blue/10 text-apple-blue' : 'text-apple-label active:bg-apple-bg'
          }`}
        >
          <span>字号</span>
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {showSize && (
          <div className="absolute top-full left-0 mt-1 card-sm card-elevated overflow-hidden z-10 min-w-[80px]">
            {FONT_SIZES.map((s) => (
              <button
                key={s.value}
                onMouseDown={(e) => {
                  e.preventDefault()
                  if (s.value === '16px') {
                    editor.chain().focus().unsetFontSize().run()
                  } else {
                    editor.chain().focus().setFontSize(s.value).run()
                  }
                  setShowSize(false)
                }}
                className="w-full px-3 py-2 text-left text-[13px] text-apple-label hover:bg-apple-separator/50 active:bg-apple-separator transition-colors"
              >
                {s.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="w-px h-5 bg-apple-separator mx-1" />

      {/* Bullet List */}
      <button
        onMouseDown={(e) => { e.preventDefault(); closePopups(); editor.chain().focus().toggleBulletList().run() }}
        className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${
          editor.isActive('bulletList') ? 'bg-apple-blue/10 text-apple-blue' : 'text-apple-label active:bg-apple-bg'
        }`}
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm0 5.25h.007v.008H3.75V12zm0 5.25h.007v.008H3.75v-.008z" />
        </svg>
      </button>

      {/* Ordered List */}
      <button
        onMouseDown={(e) => { e.preventDefault(); closePopups(); editor.chain().focus().toggleOrderedList().run() }}
        className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${
          editor.isActive('orderedList') ? 'bg-apple-blue/10 text-apple-blue' : 'text-apple-label active:bg-apple-bg'
        }`}
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12" />
          <text x="3.5" y="8" fontSize="6" fill="currentColor" stroke="none" fontWeight="600">1</text>
          <text x="3.5" y="13.5" fontSize="6" fill="currentColor" stroke="none" fontWeight="600">2</text>
          <text x="3.5" y="19" fontSize="6" fill="currentColor" stroke="none" fontWeight="600">3</text>
        </svg>
      </button>
    </div>
  )
}
