import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { DEFAULT_STEP_GOAL, MEAL_TYPES, uid } from '../lib/constants'
import { ease, fadeUp, rowVariants, spring, springPop, tapPress } from '../lib/motion'
import { ProgressMeter } from './Progress'
import { TASK_ICONS, Camera, Check, ImageIcon, Minus, Plus, Trash, X } from './Icons'

const num = (v, fallback = 0) => {
  const n = parseInt(v, 10)
  return Number.isFinite(n) ? n : fallback
}

/* ------------------------------------------------------------------ */
/*  Workout 1 — a real exercise list                                   */
/* ------------------------------------------------------------------ */
function ExerciseBody({ data, editable, onData }) {
  const list = data.exercises || []
  const [adding, setAdding] = useState(false)
  const [form, setForm] = useState({ name: '', sets: '3', reps: '10' })

  const commit = (next) => {
    const allDone = next.length > 0 && next.every((x) => x.done)
    onData({ exercises: next }, allDone ? { completed: true } : {})
  }

  const add = () => {
    const name = form.name.trim()
    if (!name) return
    commit([...list, {
      id: uid(), name,
      sets: Math.max(1, num(form.sets, 1)),
      reps: Math.max(1, num(form.reps, 1)),
      done: false,
    }])
    setForm({ name: '', sets: form.sets, reps: form.reps })
    setAdding(false)
  }

  return (
    <>
      <motion.div className="ex-list" layout>
        <AnimatePresence initial={false}>
          {list.map((x) => (
            <motion.div
              key={x.id}
              className={'ex-row' + (x.done ? ' on' : '')}
              layout
              variants={rowVariants}
              initial="hidden" animate="show" exit="exit"
            >
              <motion.button
                className={'ex-tick' + (x.done ? ' on' : '')}
                whileTap={editable ? { scale: 0.85 } : undefined}
                disabled={!editable}
                aria-pressed={x.done}
                aria-label={`${x.done ? 'Undo' : 'Complete'} ${x.name}`}
                onClick={() => commit(list.map((y) => (y.id === x.id ? { ...y, done: !y.done } : y)))}
              >
                <Check size={13} />
              </motion.button>
              <span className="ex-name">{x.name}</span>
              <span className="ex-meta">{x.sets} × {x.reps}</span>
              {editable && (
                <button
                  className="ex-del icon-btn icon-btn-sm"
                  onClick={() => commit(list.filter((y) => y.id !== x.id))}
                  aria-label={`Remove ${x.name}`}
                ><Trash size={14} /></button>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {editable && (
        <AnimatePresence mode="wait" initial={false}>
          {adding ? (
            <motion.div
              key="form" className="add-form" layout
              initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
              transition={ease}
            >
              <div className="add-grid">
                <input
                  className="inp" autoFocus placeholder="Exercise, e.g. Bench press"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  onKeyDown={(e) => { if (e.key === 'Enter') add() }}
                />
                <input
                  className="inp" type="number" min="1" inputMode="numeric" aria-label="Sets"
                  placeholder="Sets" value={form.sets}
                  onChange={(e) => setForm((f) => ({ ...f, sets: e.target.value }))}
                />
                <input
                  className="inp" type="number" min="1" inputMode="numeric" aria-label="Reps"
                  placeholder="Reps" value={form.reps}
                  onChange={(e) => setForm((f) => ({ ...f, reps: e.target.value }))}
                />
              </div>
              <div className="add-actions">
                <button className="btn btn-sm" onClick={() => setAdding(false)}>Cancel</button>
                <button className="btn btn-sm btn-primary" onClick={add} disabled={!form.name.trim()}>
                  <Plus size={14} />Add exercise
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.button
              key="btn" className="add-btn" layout whileTap={tapPress}
              onClick={() => setAdding(true)}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            >
              <Plus size={16} />Add an exercise
            </motion.button>
          )}
        </AnimatePresence>
      )}
    </>
  )
}

/* ------------------------------------------------------------------ */
/*  Workout 2 — steps                                                  */
/* ------------------------------------------------------------------ */
function StepsBody({ data, editable, onData }) {
  const goal = data.goal || DEFAULT_STEP_GOAL
  const steps = data.steps || 0
  const [draft, setDraft] = useState(String(steps))
  const [goalDraft, setGoalDraft] = useState(String(goal))

  useEffect(() => { setDraft(String(steps)) }, [steps])
  useEffect(() => { setGoalDraft(String(goal)) }, [goal])

  const setSteps = (n) => {
    const v = Math.max(0, n)
    onData({ steps: v, goal }, v >= goal ? { completed: true } : {})
  }

  return (
    <>
      <div className="steps-top">
        <div className="steps-read">
          {/* the readout is the input — no second copy of the number */}
          {editable ? (
            <input
              className="steps-big-input num" type="number" min="0" inputMode="numeric"
              aria-label="Steps walked today" value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onBlur={() => setSteps(num(draft, 0))}
              onKeyDown={(e) => { if (e.key === 'Enter') e.currentTarget.blur() }}
            />
          ) : <div className="steps-big num">{steps.toLocaleString()}</div>}
          <div className="steps-goal">
            of{' '}
            {editable ? (
              <input
                className="num" type="number" min="1" step="500" inputMode="numeric"
                aria-label="Step goal" value={goalDraft}
                onChange={(e) => setGoalDraft(e.target.value)}
                onBlur={() => {
                  const g = Math.max(1, num(goalDraft, DEFAULT_STEP_GOAL))
                  setGoalDraft(String(g))
                  if (g !== goal) onData({ goal: g, steps })
                }}
              />
            ) : <b className="num">{goal.toLocaleString()}</b>}{' '}
            steps today
          </div>
        </div>
      </div>

      {editable && (
        <div className="quick-row">
          {[500, 1000, 2500].map((n) => (
            <motion.button
              key={n} className="btn btn-sm" whileTap={tapPress}
              onClick={() => setSteps(steps + n)}
            >+{n.toLocaleString()}</motion.button>
          ))}
          <motion.button className="btn btn-sm" whileTap={tapPress} onClick={() => setSteps(goal)}>
            Hit the goal
          </motion.button>
          {steps > 0 && (
            <motion.button className="btn btn-sm" whileTap={tapPress} onClick={() => setSteps(0)}>
              Reset
            </motion.button>
          )}
        </div>
      )}
    </>
  )
}

/* ------------------------------------------------------------------ */
/*  Diet — meals with photos                                           */
/* ------------------------------------------------------------------ */
function MealsBody({ data, editable, onData, onUpload, onView }) {
  const meals = data.meals || []
  const [adding, setAdding] = useState(false)
  const [type, setType] = useState(MEAL_TYPES[0])
  const [name, setName] = useState('')
  const [file, setFile] = useState(null)
  const [busy, setBusy] = useState(false)

  const reset = () => { setName(''); setFile(null); setType(MEAL_TYPES[0]); setAdding(false) }

  const add = async () => {
    if (!name.trim() && !file) return
    setBusy(true)
    const id = uid()
    let photo_url = null
    if (file) photo_url = await onUpload(`meal-${id}`, file)
    onData({ meals: [...meals, { id, type, name: name.trim(), photo_url }] })
    setBusy(false)
    reset()
  }

  const attach = async (meal, f) => {
    const url = await onUpload(`meal-${meal.id}`, f)
    if (url) onData({ meals: meals.map((m) => (m.id === meal.id ? { ...m, photo_url: url } : m)) })
  }

  return (
    <>
      <motion.div className="meals" layout>
        <AnimatePresence initial={false}>
          {meals.map((m) => (
            <motion.div
              key={m.id} className="meal" layout
              variants={rowVariants} initial="hidden" animate="show" exit="exit"
            >
              {m.photo_url ? (
                <button className="meal-photo" onClick={() => onView(m.photo_url)} title="View photo">
                  <img src={m.photo_url} alt={m.name || m.type} />
                </button>
              ) : (
                <span className="meal-photo"><ImageIcon size={17} /></span>
              )}
              <div className="meal-text">
                <div className="meal-type">{m.type}</div>
                <div className="meal-name">{m.name || <span style={{ color: 'var(--ink-3)' }}>No description</span>}</div>
              </div>
              {editable && (
                <div className="meal-actions">
                  <label className="icon-btn icon-btn-sm" title={m.photo_url ? 'Change photo' : 'Add photo'}>
                    <Camera size={14} />
                    <input
                      type="file" accept="image/*" hidden
                      onChange={(e) => { const f = e.target.files?.[0]; if (f) attach(m, f); e.target.value = '' }}
                    />
                    <span className="sr-only">{m.photo_url ? 'Change photo' : 'Add photo'}</span>
                  </label>
                  <button
                    className="icon-btn icon-btn-sm ex-del"
                    onClick={() => onData({ meals: meals.filter((x) => x.id !== m.id) })}
                    aria-label={`Remove ${m.type}`}
                  ><Trash size={14} /></button>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {editable && (
        <AnimatePresence mode="wait" initial={false}>
          {adding ? (
            <motion.div
              key="form" className="add-form" layout
              initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
              transition={ease}
            >
              <div className="type-row" role="group" aria-label="Meal type">
                {MEAL_TYPES.map((t) => (
                  <motion.button
                    key={t} className={'type-pill' + (type === t ? ' on' : '')}
                    whileTap={tapPress} onClick={() => setType(t)} aria-pressed={type === t}
                  >{t}</motion.button>
                ))}
              </div>
              <input
                className="inp" autoFocus placeholder="What did you eat?"
                value={name} onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') add() }}
              />
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                <label className="file-pick">
                  <Camera size={15} />
                  {file ? file.name.slice(0, 22) : 'Add a photo'}
                  <input
                    type="file" accept="image/*" hidden
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                  />
                </label>
                {file && (
                  <button className="icon-btn icon-btn-sm" onClick={() => setFile(null)} aria-label="Remove chosen photo">
                    <X size={14} />
                  </button>
                )}
              </div>
              <div className="add-actions">
                <button className="btn btn-sm" onClick={reset} disabled={busy}>Cancel</button>
                <button
                  className="btn btn-sm btn-primary" onClick={add}
                  disabled={busy || (!name.trim() && !file)}
                >
                  <Plus size={14} />{busy ? 'Saving…' : `Add ${type.toLowerCase()}`}
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.button
              key="btn" className="add-btn" layout whileTap={tapPress}
              onClick={() => setAdding(true)}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            >
              <Plus size={16} />Add breakfast, lunch, dinner or a snack
            </motion.button>
          )}
        </AnimatePresence>
      )}
    </>
  )
}

/* ------------------------------------------------------------------ */
/*  Water / reading — a simple counter against a target                */
/* ------------------------------------------------------------------ */
function CounterBody({ task, data, editable, onData }) {
  const goal = data.goal || task.defaultGoal
  const value = data.value || 0
  const bump = (delta) => {
    const v = Math.max(0, value + delta)
    onData({ value: v, goal }, v >= goal ? { completed: true } : {})
  }
  if (!editable) {
    return <div className="counter"><span className="counter-val num">{value}</span><span className="counter-unit">of {goal} {task.unit}</span></div>
  }
  return (
    <div className="counter">
      <motion.button
        className="icon-btn" whileTap={tapPress} onClick={() => bump(-task.step)}
        disabled={value <= 0} aria-label={`Remove ${task.step} ${task.unit}`}
      ><Minus size={17} /></motion.button>
      <span className="counter-val num">{value}</span>
      <motion.button
        className="icon-btn" whileTap={tapPress} onClick={() => bump(task.step)}
        aria-label={`Add ${task.step} ${task.unit}`}
      ><Plus size={17} /></motion.button>
      <span className="counter-unit">of {goal} {task.unit}</span>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Progress photo                                                     */
/* ------------------------------------------------------------------ */
function PhotoBody({ entry, editable, onPhoto, onView }) {
  const [busy, setBusy] = useState(false)
  const pick = async (f) => { setBusy(true); await onPhoto(f); setBusy(false) }
  return (
    <>
      <div className={'photo-slot' + (entry.photo_url ? '' : ' empty')}>
        {entry.photo_url ? (
          <motion.img
            key={entry.photo_url} src={entry.photo_url} alt="Progress photo"
            initial={{ opacity: 0, scale: 1.03 }} animate={{ opacity: 1, scale: 1 }} transition={ease}
            onClick={() => onView(entry.photo_url)} style={{ cursor: 'zoom-in' }}
          />
        ) : <ImageIcon size={30} />}
      </div>
      {editable && (
        <label className="file-pick" style={{ justifyContent: 'center' }}>
          <Camera size={15} />
          {busy ? 'Uploading…' : entry.photo_url ? 'Replace photo' : 'Upload today’s photo'}
          <input
            type="file" accept="image/*" hidden
            onChange={(e) => { const f = e.target.files?.[0]; if (f) pick(f); e.target.value = '' }}
          />
        </label>
      )}
    </>
  )
}

/* ------------------------------------------------------------------ */
/*  The card itself                                                    */
/* ------------------------------------------------------------------ */
export default function TaskCard({
  task, person, day, entry, progress, editable,
  onToggle, onDetails, onData, onPhoto, onUpload, onView,
}) {
  const [notesOpen, setNotesOpen] = useState(false)
  const [text, setText] = useState(entry.details || '')
  const Icon = TASK_ICONS[task.key]
  const done = !!entry.completed
  const data = entry.data || {}

  useEffect(() => { setText(entry.details || '') }, [entry.details, person, day, task.key])

  const showMeter = task.kind !== 'photo'

  return (
    <motion.div
      className={'card' + (done ? ' done' : '') + (editable ? '' : ' readonly')}
      data-person={person.toLowerCase()}
      variants={fadeUp}
      layout
    >
      <div className="card-head">
        <span className="checkbox-hit">
          <motion.button
            className={'checkbox' + (done ? ' on' : '')}
            onClick={editable ? onToggle : undefined}
            disabled={!editable}
            aria-pressed={done}
            aria-label={`${task.label}: ${done ? 'mark not done' : 'mark done'}`}
            whileTap={editable ? { scale: 0.86 } : undefined}
            animate={done ? { scale: [1, 1.16, 1] } : { scale: 1 }}
            transition={done ? springPop : spring}
          >
            <Check size={16} />
          </motion.button>
        </span>

        <div className="card-title">
          <div className="card-label">{task.label}</div>
          <div className="card-hint">{progress.label || task.hint}</div>
        </div>

        <div className="card-tools">
          {Icon && <span style={{ color: 'var(--ink-3)' }}><Icon size={19} /></span>}
          <button
            className={'icon-btn icon-btn-sm' + (entry.details ? ' on' : '')}
            onClick={() => setNotesOpen((o) => !o)}
            aria-expanded={notesOpen}
            aria-label="Notes"
            title="Notes"
          >{notesOpen ? <X size={14} /> : <Plus size={14} />}</button>
        </div>
      </div>

      <div className="card-body">
        {showMeter && <ProgressMeter label={task.meter || 'Section'} ratio={progress.ratio} tone={progress.ratio >= 1 ? 'go' : ''} size="sm" />}

        {task.kind === 'exercises' && <ExerciseBody data={data} editable={editable} onData={onData} />}
        {task.kind === 'steps' && <StepsBody data={data} editable={editable} onData={onData} />}
        {task.kind === 'meals' && <MealsBody data={data} editable={editable} onData={onData} onUpload={onUpload} onView={onView} />}
        {task.kind === 'counter' && <CounterBody task={task} data={data} editable={editable} onData={onData} />}
        {task.kind === 'photo' && <PhotoBody entry={entry} editable={editable} onPhoto={onPhoto} onView={onView} />}

        <AnimatePresence initial={false}>
          {notesOpen && (
            <motion.div
              className="note-area"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={ease}
              style={{ overflow: 'hidden' }}
            >
              <textarea
                className="inp" rows={3}
                placeholder={editable ? `Notes for ${task.label.toLowerCase()}…` : 'No notes'}
                value={text}
                readOnly={!editable}
                onChange={(e) => setText(e.target.value)}
                onBlur={() => { if (editable && text !== (entry.details || '')) onDetails(text) }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
