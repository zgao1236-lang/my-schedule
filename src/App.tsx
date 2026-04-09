import { useAppStore } from './stores/useAppStore'
import { useNoteStore } from './stores/useNoteStore'
import { useThemeStore } from './stores/useThemeStore'
import { useInitData } from './hooks/useInitData'
import { useReminder } from './hooks/useReminder'
import { CalendarPage } from './features/calendar/CalendarPage'
import { NotesPage } from './features/notes/NotesPage'
import { RemindersPage } from './features/reminders/RemindersPage'
import { SearchPage } from './features/search/SearchPage'
import type { TabType } from './types'

/* ── Tab definitions ── */
const TABS: { key: TabType; label: string; d: string }[] = [
  { key: 'calendar', label: '日历',
    d: 'M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5' },
  { key: 'notes', label: '记事',
    d: 'M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10' },
  { key: 'reminders', label: '提醒',
    d: 'M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0' },
  { key: 'search', label: '搜索',
    d: 'M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z' },
]

const PAGE_TITLE: Record<TabType, string | null> = {
  calendar: null,
  notes: '记事本',
  reminders: '提醒事项',
  search: '搜索',
}

function ThemeToggle() {
  const { mode, setMode } = useThemeStore()
  const next = mode === 'light' ? 'dark' : mode === 'dark' ? 'system' : 'light'
  return (
    <button
      onClick={() => setMode(next)}
      className="w-10 h-10 flex items-center justify-center rounded-xl text-apple-label-secondary active:bg-apple-separator transition-colors"
    >
      {mode === 'light' && (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
        </svg>
      )}
      {mode === 'dark' && (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
        </svg>
      )}
      {mode === 'system' && (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25A2.25 2.25 0 015.25 3h13.5A2.25 2.25 0 0121 5.25z" />
        </svg>
      )}
    </button>
  )
}

function PageContent({ tab }: { tab: TabType }) {
  switch (tab) {
    case 'calendar': return <CalendarPage />
    case 'notes': return <NotesPage />
    case 'reminders': return <RemindersPage />
    case 'search': return <SearchPage />
  }
}

export default function App() {
  useInitData()
  useReminder()
  const activeTab = useAppStore((s) => s.activeTab)
  const setActiveTab = useAppStore((s) => s.setActiveTab)
  const activeNoteId = useNoteStore((s) => s.activeNoteId)

  const isEditor = activeTab === 'notes' && !!activeNoteId
  const showHeader = !isEditor && !!PAGE_TITLE[activeTab]
  const showTabBar = !isEditor

  return (
    <div className="mx-auto max-w-[430px] min-h-dvh bg-apple-bg flex flex-col relative">
      {/* ── Header ── */}
      {showHeader && (
        <header className="glass sticky top-0 z-30 border-b border-apple-separator">
          <div
            className="px-5 flex items-end justify-between"
            style={{ paddingTop: 'calc(var(--safe-area-top, 0px) + 10px)' }}
          >
            <h1 className="text-[28px] font-bold tracking-tight text-apple-label pb-2.5">
              {PAGE_TITLE[activeTab]}
            </h1>
            <div className="pb-1.5"><ThemeToggle /></div>
          </div>
        </header>
      )}

      {/* ── Page ── */}
      <main className={`flex-1 overflow-y-auto ${showTabBar ? 'pb-[calc(80px+var(--safe-area-bottom,0px))]' : ''}`}>
        <div className="page-enter" key={isEditor ? 'editor' : activeTab}>
          <PageContent tab={activeTab} />
        </div>
      </main>

      {/* ── Tab Bar ── */}
      {showTabBar && (
        <nav
          className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-40 glass border-t border-apple-separator"
          style={{ paddingBottom: 'var(--safe-area-bottom, 0px)' }}
        >
          <div className="flex items-stretch h-[52px]">
            {TABS.map(({ key, label, d }) => {
              const on = activeTab === key
              return (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`flex-1 flex flex-col items-center justify-center gap-[3px] transition-colors ${
                    on ? 'text-apple-blue' : 'text-apple-label-tertiary'
                  }`}
                >
                  <svg className="w-[22px] h-[22px]" fill="none" viewBox="0 0 24 24"
                    stroke="currentColor" strokeWidth={on ? 2 : 1.6}
                    strokeLinecap="round" strokeLinejoin="round">
                    <path d={d} />
                  </svg>
                  <span className={`text-[10px] ${on ? 'font-semibold' : 'font-medium'}`}>{label}</span>
                </button>
              )
            })}
          </div>
        </nav>
      )}
    </div>
  )
}
