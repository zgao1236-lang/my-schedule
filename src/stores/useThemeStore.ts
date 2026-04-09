import { create } from 'zustand'

type ThemeMode = 'system' | 'light' | 'dark'

interface ThemeState {
  mode: ThemeMode
  setMode: (mode: ThemeMode) => void
}

function getSystemDark(): boolean {
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

function applyTheme(mode: ThemeMode) {
  const isDark = mode === 'dark' || (mode === 'system' && getSystemDark())
  document.documentElement.classList.toggle('dark', isDark)
  // Update theme-color meta
  const meta = document.querySelector('meta[name="theme-color"]:not([media])')
    || document.querySelector('meta[name="theme-color"]')
  if (meta) meta.setAttribute('content', isDark ? '#1C1C1E' : '#4F46E5')
}

const stored = localStorage.getItem('theme-mode') as ThemeMode | null

export const useThemeStore = create<ThemeState>((set) => ({
  mode: stored || 'system',
  setMode: (mode) => {
    localStorage.setItem('theme-mode', mode)
    applyTheme(mode)
    set({ mode })
  },
}))

// Apply on load
applyTheme(stored || 'system')

// Listen for system changes
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
  const { mode } = useThemeStore.getState()
  if (mode === 'system') applyTheme('system')
})
