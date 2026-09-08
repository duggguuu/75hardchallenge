import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { TASK_COUNT, TOTAL_DAYS, prettyDate } from '../lib/constants'
import { ease, spring, tapPress } from '../lib/motion'
import { ProgressBar } from './Progress'
import { Calendar, ChevronLeft, ChevronRight, Pause } from './Icons'

/* Day navigation is never gated on completing anything — you can move to
   any day at any time, in either direction. */
export default function DayNav({
  day, go, jumpTo, person, dateFor, dayInfo, onSaveDay, canEdit, doneCount, todayDay,
}) {
  const [open, setOpen] = useState(false)
  const [note, setNote] = useState(dayInfo.note || '')

  useEffect(() => { setNote(dayInfo.note || '') }, [dayInfo.note, day, person])
  useEffect(() => { setOpen(false) }, [person])

  const iso = dateFor(person, day)
  const label = prettyDate(iso)
  const isException = !!dayInfo.is_exception
  const ratio = doneCount / TASK_COUNT

  return (
    <section className="panel daycard" data-person={person.toLowerCase()}>
      <div className="daynav">
        <motion.button
          className="round-btn"
          whileTap={tapPress}
          onClick={() => go(-1)}
          disabled={day <= 1}
          aria-label="Previous day"
        ><ChevronLeft size={20} /></motion.button>

        <div className="daynav-center">
          <div className="daynav-day num">Day {day}</div>
          <button
            className="daynav-date"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            title="Set the date for this day, or mark it an exception"
          >
            <Calendar size={14} />
            {label || 'set a date'}
          </button>
        </div>

        <motion.button
          className="round-btn"
          whileTap={tapPress}
          onClick={() => go(1)}
          disabled={day >= TOTAL_DAYS}
          aria-label="Next day"
        ><ChevronRight size={20} /></motion.button>
      </div>

      <div className="day-tools">
        {todayDay && todayDay !== day && (
          <motion.button className="btn btn-sm" whileTap={tapPress} onClick={() => jumpTo(todayDay)}>
            Jump to today (Day {todayDay})
          </motion.button>
        )}
        {todayDay === day && <span className="chip chip-go">Today</span>}
        {isException && <span className="chip"><Pause size={12} />Exception day</span>}
      </div>

      <div className="day-progress">
        <div className="pmeta">
          <span className="pmeta-label">Day progress</span>
          <span className="pmeta-val num">{doneCount}/{TASK_COUNT} · {Math.round(ratio * 100)}%</span>
        </div>
        <ProgressBar ratio={ratio} size="lg" tone={doneCount === TASK_COUNT ? 'go' : ''} />
      </div>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            className="dateline"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={ease}
            style={{ overflow: 'hidden' }}
          >
            <div className="dateline-row">
              <label htmlFor="day-date">Date for this day</label>
              <input
                id="day-date"
                className="inp"
                type="date"
                value={iso || ''}
                disabled={!canEdit}
                onChange={(e) => onSaveDay({ date: e.target.value || null })}
              />
              {dayInfo.date && canEdit && (
                <button className="btn btn-sm" onClick={() => onSaveDay({ date: null })}>
                  Reset
                </button>
              )}
            </div>

            <div className="dateline-row">
              <label htmlFor="day-exc" style={{ flex: 1 }}>
                Exception day
                <span style={{ display: 'block', fontWeight: 500, color: 'var(--ink-3)', fontSize: 12 }}>
                  Skipped on purpose — it won't break the streak or count against the total.
                </span>
              </label>
              <button
                id="day-exc"
                role="switch"
                aria-checked={isException}
                className={'switch' + (isException ? ' on' : '')}
                disabled={!canEdit}
                onClick={() => onSaveDay({ is_exception: !isException })}
              >
                <motion.span
                  className="switch-knob"
                  animate={{ x: isException ? 19 : 0 }}
                  transition={spring}
                />
                <span className="sr-only">Exception day</span>
              </button>
            </div>

            <AnimatePresence initial={false}>
              {isException && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={ease}
                  style={{ overflow: 'hidden' }}
                >
                  <input
                    className="inp"
                    placeholder="Why? (travelling, illness, rest…)"
                    value={note}
                    readOnly={!canEdit}
                    onChange={(e) => setNote(e.target.value)}
                    onBlur={() => { if (canEdit && note !== (dayInfo.note || '')) onSaveDay({ note }) }}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {isException && !open && (
        <div className="exception-note">
          <Pause size={15} />
          <div>
            <b>Exception day.</b>{' '}
            {dayInfo.note || 'Off the hook for this one — it stays out of the totals.'}
          </div>
        </div>
      )}
    </section>
  )
}
