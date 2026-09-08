import { motion } from 'framer-motion'
import { TASK_COUNT, TOTAL_DAYS } from '../lib/constants'
import { spring } from '../lib/motion'
import { ProgressMeter } from './Progress'

/* Seventy-five squares. Green when the day is complete, tinted when it's
   partly done, hatched when it's an exception day. */
export default function Wall({ person, name, viewDay, jumpTo, dayTaskCount, isException, stats }) {
  const s = stats(person)
  return (
    <section className="panel wall-card" data-person={person.toLowerCase()}>
      <div className="wall-head">
        <h2>The wall — <span style={{ color: 'var(--accent)' }}>{name}</span></h2>
        <div className="legend">
          <span><i className="sw sw-full" /> all {TASK_COUNT}</span>
          <span><i className="sw sw-part" /> partly</span>
          <span><i className="sw sw-empty" /> nothing</span>
          <span><i className="sw sw-exc" /> exception</span>
        </div>
      </div>

      <div style={{ display: 'grid', gap: 8, marginBottom: 15 }}>
        <ProgressMeter
          label="Total progress"
          ratio={s.percent / 100}
          right={`${s.percent}% · ${s.tasksDone}/${s.activeDays * TASK_COUNT} tasks`}
          tone={s.percent >= 100 ? 'go' : ''}
        />
        <ProgressMeter
          label="Days completed"
          ratio={s.daysPercent / 100}
          right={`${s.daysDone}/${s.activeDays} days`}
          tone="go"
          size="sm"
        />
      </div>

      <div className="wall">
        {Array.from({ length: TOTAL_DAYS }, (_, i) => i + 1).map((d) => {
          const exc = isException(person, d)
          const doneCount = dayTaskCount(person, d)
          const state = exc ? 'exc' : doneCount === TASK_COUNT ? 'full' : doneCount > 0 ? 'part' : 'empty'
          return (
            <motion.button
              key={d}
              className={`cell cell-${state}` + (d === viewDay ? ' cell-on' : '')}
              onClick={() => jumpTo(d)}
              whileHover={{ scale: 1.09 }}
              whileTap={{ scale: 0.94 }}
              transition={spring}
              title={exc ? `Day ${d} — exception day` : `Day ${d} — ${doneCount}/${TASK_COUNT}`}
            >
              {d}
            </motion.button>
          )
        })}
      </div>
    </section>
  )
}
