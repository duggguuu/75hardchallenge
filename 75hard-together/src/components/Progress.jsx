import { motion, useReducedMotion } from 'framer-motion'
import { spring } from '../lib/motion'

/* An animated bar. `ratio` is 0–1; the fill springs to its new width so
   ticking a task off reads as movement, not a repaint. */
export function ProgressBar({ ratio = 0, size = '', tone = '', className = '' }) {
  const reduce = useReducedMotion()
  const w = `${Math.round(Math.min(1, Math.max(0, ratio)) * 100)}%`
  return (
    <div className={`pbar ${size} ${className}`.trim()}>
      <motion.div
        className={`pbar-fill ${tone}`.trim()}
        initial={false}
        animate={{ width: w }}
        transition={reduce ? { duration: 0 } : spring}
      />
    </div>
  )
}

/* Bar plus its label and percentage, the pairing used across the app. */
export function ProgressMeter({ label, ratio = 0, right, tone = '', size = '' }) {
  const percent = Math.round(Math.min(1, Math.max(0, ratio)) * 100)
  return (
    <div className="card-section-bar">
      <div className="pmeta">
        <span className="pmeta-label">{label}</span>
        <span className="pmeta-val num">{right ?? `${percent}%`}</span>
      </div>
      <ProgressBar ratio={ratio} tone={tone} size={size} />
    </div>
  )
}
