import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { getTheme, type Theme, type ThemeId } from '../themes'

interface ThemeContextValue {
  currentTheme: Theme
  setTheme: (id: ThemeId) => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

const STORAGE_KEY = 'dhuno-theme'

function hexToRgbStr(hex: string) {
  if (!/^#[0-9A-Fa-f]{6}$/.test(hex)) return null
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `${r}, ${g}, ${b}`
}

function applyTheme(theme: Theme) {
  const root = document.documentElement
  for (const [prop, value] of Object.entries(theme.vars)) {
    root.style.setProperty(prop, value)
    const rgb = hexToRgbStr(value)
    if (rgb) {
      root.style.setProperty(`${prop}-rgb`, rgb)
    }
  }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themeId, setThemeId] = useState<ThemeId>(() => {
    try {
      return (localStorage.getItem(STORAGE_KEY) as ThemeId) ?? 'neon'
    } catch {
      return 'neon'
    }
  })

  const currentTheme = useMemo(() => getTheme(themeId), [themeId])

  // Apply CSS vars whenever theme changes
  useEffect(() => {
    applyTheme(currentTheme)
  }, [currentTheme])

  // Persist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, themeId)
    } catch {
      // ignore storage errors
    }
  }, [themeId])

  // Apply immediately on first render (before paint) to avoid flash
  useLayoutEffect(() => {
    applyTheme(currentTheme)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const setTheme = useCallback((id: ThemeId) => {
    setThemeId(id)
  }, [])

  const value = useMemo(() => ({ currentTheme, setTheme }), [currentTheme, setTheme])

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used inside <ThemeProvider>')
  return ctx
}
