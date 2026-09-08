import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { THEMES, useTheme } from '../lib/useTheme'
import { popVariants, spring, tapPress } from '../lib/motion'
import { Moon, Monitor, Palette, Sun } from './Icons'

const MODES = [
  { id: 'light', label: 'Light', Icon: Sun },
  { id: 'system', label: 'Auto', Icon: Monitor },
  { id: 'dark', label: 'Dark', Icon: Moon },
]

export default function ThemePicker() {
  const { theme, setTheme, mode, setMode } = useTheme()
  const [open, setOpen] = useState(false)
  const wrapRef = useRef(null)

  useEffect(() => {
    if (!open) return
    const onDown = (e) => { if (!wrapRef.current?.contains(e.target)) setOpen(false) }
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('pointerdown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const modeIndex = MODES.findIndex((m) => m.id === mode)

  return (
    <div className="pop-wrap" ref={wrapRef}>
      <motion.button
        className={'icon-btn' + (open ? ' on' : '')}
        onClick={() => setOpen((o) => !o)}
        whileTap={tapPress}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label="Theme and appearance"
        title="Theme and appearance"
      >
        <Palette size={18} />
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="popover"
            role="dialog"
            aria-label="Theme and appearance"
            variants={popVariants}
            initial="hidden"
            animate="show"
            exit="exit"
            style={{ transformOrigin: 'top right' }}
          >
            <h3 className="pop-title">Appearance</h3>
            <div className="mode-row">
              <motion.span
                className="mode-pill"
                animate={{ x: `${modeIndex * 100}%` }}
                transition={spring}
                style={{ width: 'calc((100% - 8px) / 3)' }}
              />
              {MODES.map(({ id, label, Icon }) => (
                <button
                  key={id}
                  className={'mode-btn' + (mode === id ? ' on' : '')}
                  onClick={() => setMode(id)}
                  aria-pressed={mode === id}
                >
                  <Icon size={14} />{label}
                </button>
              ))}
            </div>

            <h3 className="pop-title" style={{ marginTop: 16 }}>Theme</h3>
            <div className="theme-grid">
              {THEMES.map((t) => (
                <motion.button
                  key={t.id}
                  className={'theme-opt' + (theme === t.id ? ' on' : '')}
                  onClick={() => setTheme(t.id)}
                  whileTap={tapPress}
                  aria-pressed={theme === t.id}
                >
                  <span className="swatches" aria-hidden="true">
                    {t.swatches.map((c) => <i key={c} style={{ background: c }} />)}
                  </span>
                  {t.name}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
