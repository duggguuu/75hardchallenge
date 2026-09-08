import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

/* Six themes, each with a light and a dark palette (see themes.css).
   `mode` may be 'system', in which case we resolve it against the OS. */
export const THEMES = [
  { id: 'ember', name: 'Ember', swatches: ['#d97706', '#0f7a4a', '#fffaf0'] },
  { id: 'glass', name: 'Glass', swatches: ['#786cff', '#ff80c4', '#50dcdc'] },
  { id: 'forest', name: 'Forest', swatches: ['#2f6b3f', '#1f6b5e', '#f2f6ef'] },
  { id: 'ocean', name: 'Ocean', swatches: ['#0b6f8c', '#43d6b4', '#f0f7fb'] },
  { id: 'sunset', name: 'Sunset', swatches: ['#cf3a72', '#7a3fbd', '#f59e0b'] },
  { id: 'mono', name: 'Mono', swatches: ['#171717', '#8d8d89', '#f7f7f6'] },
]

const THEME_IDS = THEMES.map((t) => t.id)
const MODES = ['light', 'system', 'dark']

const ThemeCtx = createContext(null)

const readStored = (key, allowed, fallback) => {
  try {
    const v = localStorage.getItem(key)
    return allowed.includes(v) ? v : fallback
  } catch {
    return fallback
  }
}

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => readStored('theme', THEME_IDS, 'ember'))
  const [mode, setModeState] = useState(() => readStored('mode', MODES, 'system'))
  const [systemDark, setSystemDark] = useState(
    () => typeof matchMedia === 'function' && matchMedia('(prefers-color-scheme: dark)').matches,
  )

  useEffect(() => {
    if (typeof matchMedia !== 'function') return
    const mq = matchMedia('(prefers-color-scheme: dark)')
    const onChange = (e) => setSystemDark(e.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  const resolved = mode === 'system' ? (systemDark ? 'dark' : 'light') : mode

  useEffect(() => {
    const root = document.documentElement
    root.dataset.theme = theme
    root.dataset.mode = resolved
    // keep the browser chrome in step with the page
    const meta = document.querySelector('meta[name="theme-color"]')
    if (meta) {
      const bg = getComputedStyle(root).getPropertyValue('--bg').trim()
      if (bg) meta.setAttribute('content', bg)
    }
  }, [theme, resolved])

  const setTheme = useCallback((id) => {
    setThemeState(id)
    try { localStorage.setItem('theme', id) } catch { /* private mode */ }
  }, [])

  const setMode = useCallback((m) => {
    setModeState(m)
    try { localStorage.setItem('mode', m) } catch { /* private mode */ }
  }, [])

  const value = useMemo(
    () => ({ theme, setTheme, mode, setMode, resolved }),
    [theme, setTheme, mode, setMode, resolved],
  )

  return <ThemeCtx.Provider value={value}>{children}</ThemeCtx.Provider>
}

export const useTheme = () => {
  const ctx = useContext(ThemeCtx)
  if (!ctx) throw new Error('useTheme must be used inside <ThemeProvider>')
  return ctx
}
