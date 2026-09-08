import { motion, useReducedMotion } from 'framer-motion'
import { spring } from '../lib/motion'
import { ProgressBar } from './Progress'
import { Handshake, Trophy } from './Icons'

/* Who is winning, and by how much. The split bar is the whole story at a
   glance; the rows underneath say what it's measuring. */
export default function Standings({ standings, profiles, onPick }) {
  const reduce = useReducedMotion()
  const { rows, leader, tied, shareA } = standings
  const [a, b] = rows
  const nameOf = (n) => profiles[n]?.display_name || n

  const leftPct = Math.round(shareA * 100)
  const anyProgress = a.tasksDone + b.tasksDone > 0

  return (
    <section className="panel standings">
      <div className="standings-head">
        <span className="standings-title">Head to head</span>
        <span className="standings-verdict" style={{ color: tied ? 'var(--ink-2)' : `var(--${leader.toLowerCase()})` }}>
          {tied ? <Handshake size={17} /> : <Trophy size={17} />}
          {!anyProgress ? 'Nobody has started' : tied ? 'Dead even' : `${nameOf(leader)} is ahead`}
        </span>
      </div>

      <div className="vs-bar" role="img"
        aria-label={`${nameOf(a.name)} ${a.tasksDone} tasks, ${nameOf(b.name)} ${b.tasksDone} tasks`}>
        <motion.div
          className="vs-half left"
          initial={false}
          animate={{ width: `${anyProgress ? leftPct : 50}%` }}
          transition={reduce ? { duration: 0 } : spring}
        >
          {leftPct >= 18 && <span>{nameOf(a.name)}</span>}
        </motion.div>
        <motion.div
          className="vs-half right"
          initial={false}
          animate={{ width: `${anyProgress ? 100 - leftPct : 50}%` }}
          transition={reduce ? { duration: 0 } : spring}
        >
          {100 - leftPct >= 18 && <span>{nameOf(b.name)}</span>}
        </motion.div>
      </div>

      <div className="standings-rows">
        {rows.map((r) => (
          <button
            key={r.name}
            className="standings-row"
            data-person={r.name.toLowerCase()}
            onClick={() => onPick(r.name)}
            title={`Show ${nameOf(r.name)}'s log`}
          >
            <span className="who">{nameOf(r.name)}</span>
            <ProgressBar ratio={r.percent / 100} />
            <span className="val num">{r.percent}% · {r.daysDone}d</span>
          </button>
        ))}
      </div>
    </section>
  )
}
