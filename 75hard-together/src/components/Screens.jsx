import { useState } from 'react'
import { motion } from 'framer-motion'
import { PEOPLE } from '../lib/constants'
import { fadeUp, spring, stagger, tapPress } from '../lib/motion'
import { Flame, X } from './Icons'

export function Splash() {
  return (
    <div className="centered">
      <motion.div
        className="mark-lg"
        animate={{ scale: [1, 1.08, 1] }}
        transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
      >
        <Flame size={32} />
      </motion.div>
      <p style={{ marginTop: 16, color: 'var(--ink-2)' }}>Loading your challenge…</p>
    </div>
  )
}

export function Onboarding({ onPick }) {
  return (
    <div className="centered">
      <motion.div className="centered-inner" variants={stagger} initial="hidden" animate="show">
        <motion.div className="mark-lg" variants={fadeUp}><Flame size={32} /></motion.div>
        <motion.h1 variants={fadeUp}>75 Hard, together</motion.h1>
        <motion.p variants={fadeUp}>
          Two people. Seventy-five days. No excuses. Who’s checking in?
        </motion.p>
        <motion.div className="pick-row" variants={fadeUp}>
          {PEOPLE.map((p) => (
            <motion.button
              key={p}
              className="pick-btn"
              data-person={p.toLowerCase()}
              onClick={() => onPick(p)}
              whileHover={{ y: -2 }}
              whileTap={tapPress}
              transition={spring}
            >
              I’m {p}
            </motion.button>
          ))}
        </motion.div>
        <motion.span variants={fadeUp} style={{ fontSize: 13, color: 'var(--ink-3)' }}>
          You can switch anytime from the top bar.
        </motion.span>
      </motion.div>
    </div>
  )
}

export function SetupNeeded() {
  return (
    <div className="centered">
      <div className="centered-inner">
        <div className="mark-lg"><Flame size={32} /></div>
        <h1>Almost there</h1>
        <p>Add your Supabase URL and anon key in Vercel, then redeploy. The steps are in the README.</p>
        <code className="envcode">VITE_SUPABASE_URL=…<br />VITE_SUPABASE_ANON_KEY=…</code>
      </div>
    </div>
  )
}

/* Shown when the v2 columns/tables aren't in the database yet. */
export function MigrationBanner() {
  const [hidden, setHidden] = useState(false)
  if (hidden) return null
  return (
    <motion.div className="banner" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={spring}>
      <div>
        <b>One quick database step.</b> Exercises, steps, meals, cover photos and
        exception days need the v2 tables. Open Supabase → SQL Editor and run{' '}
        <code>supabase-migration.sql</code> from this repo, then reload. Everything
        else keeps working in the meantime.
      </div>
      <button className="banner-x icon-btn icon-btn-sm" onClick={() => setHidden(true)} aria-label="Dismiss">
        <X size={14} />
      </button>
    </motion.div>
  )
}
