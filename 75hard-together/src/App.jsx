import { useEffect, useMemo, useState, useCallback } from 'react'
import { supabase, hasSupabase } from './supabaseClient'

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const PEOPLE = ['Duggu', 'Pumpkin']
const TOTAL_DAYS = 75

const TASKS = [
  { key: 'workout1', label: 'Workout 1', hint: '45 minutes' },
  { key: 'workout2', label: 'Workout 2', hint: '45 minutes · one must be outdoors' },
  { key: 'diet', label: 'Diet', hint: 'stick to it — no cheats, no alcohol' },
  { key: 'water', label: 'Water', hint: '1 gallon (3.8 L)' },
  { key: 'reading', label: 'Read', hint: '10 pages, non-fiction' },
  { key: 'photo', label: 'Progress photo', hint: 'one every day' },
]

const keyOf = (name, day, task) => `${name}|${day}|${task}`

/* ------------------------------------------------------------------ */
/*  Small SVG icons                                                    */
/* ------------------------------------------------------------------ */

const Check = (p) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.2"
    strokeLinecap="round" strokeLinejoin="round" {...p}>
    <path d="M20 6 9 17l-5-5" />
  </svg>
)
const Chevron = ({ dir = 'right', ...p }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"
    strokeLinecap="round" strokeLinejoin="round"
    style={{ transform: dir === 'left' ? 'rotate(180deg)' : 'none' }} {...p}>
    <path d="m9 18 6-6-6-6" />
  </svg>
)
const Camera = (p) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round" {...p}>
    <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3Z" />
    <circle cx="12" cy="13" r="3.2" />
  </svg>
)

/* ------------------------------------------------------------------ */
/*  App                                                                */
/* ------------------------------------------------------------------ */

export default function App() {
  const [me, setMe] = useState(() => localStorage.getItem('who') || null)
  const [entries, setEntries] = useState([])
  const [profiles, setProfiles] = useState({})
  const [ready, setReady] = useState(false)
  const [viewPerson, setViewPerson] = useState(me || 'Duggu')
  const [viewDay, setViewDay] = useState(1)
  const [showProfile, setShowProfile] = useState(false)
  const [lightbox, setLightbox] = useState(null)

  /* ---- data loading + realtime ---- */
  const fetchAll = useCallback(async () => {
    if (!hasSupabase) { setReady(true); return }
    const [{ data: e }, { data: p }] = await Promise.all([
      supabase.from('entries').select('*'),
      supabase.from('profiles').select('*'),
    ])
    setEntries(e || [])
    const map = {}
    ;(p || []).forEach((row) => { map[row.name] = row })
    setProfiles(map)
    setReady(true)
  }, [])

  useEffect(() => {
    fetchAll()
    if (!hasSupabase) return
    const channel = supabase
      .channel('room-75hard')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'entries' }, fetchAll)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, fetchAll)
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [fetchAll])

  /* ---- lookups + derived stats ---- */
  const entryMap = useMemo(() => {
    const m = new Map()
    entries.forEach((row) => m.set(keyOf(row.name, row.day, row.task), row))
    return m
  }, [entries])

  const getEntry = useCallback(
    (name, day, task) =>
      entryMap.get(keyOf(name, day, task)) || { completed: false, details: '', photo_url: null },
    [entryMap],
  )

  const isDayComplete = useCallback(
    (name, day) => TASKS.every((t) => getEntry(name, day, t.key).completed),
    [getEntry],
  )
  const dayTaskCount = useCallback(
    (name, day) => TASKS.reduce((n, t) => n + (getEntry(name, day, t.key).completed ? 1 : 0), 0),
    [getEntry],
  )
  const streak = useCallback(
    (name) => {
      let s = 0
      for (let d = 1; d <= TOTAL_DAYS; d++) { if (isDayComplete(name, d)) s++; else break }
      return s
    },
    [isDayComplete],
  )
  const daysDone = useCallback(
    (name) => {
      let n = 0
      for (let d = 1; d <= TOTAL_DAYS; d++) if (isDayComplete(name, d)) n++
      return n
    },
    [isDayComplete],
  )

  /* ---- when we learn who "me" is, jump to the day they're on ---- */
  useEffect(() => {
    if (me && ready) {
      setViewPerson(me)
      setViewDay(Math.min(streak(me) + 1, TOTAL_DAYS))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [me, ready])

  /* ---- writes ---- */
  const saveEntry = useCallback(async (name, day, task, patch) => {
    // optimistic local update so it feels instant
    setEntries((prev) => {
      const i = prev.findIndex((r) => r.name === name && r.day === day && r.task === task)
      if (i === -1) return [...prev, { name, day, task, completed: false, details: '', photo_url: null, ...patch }]
      const next = [...prev]
      next[i] = { ...next[i], ...patch }
      return next
    })
    if (!hasSupabase) return
    const { error } = await supabase
      .from('entries')
      .upsert({ name, day, task, ...patch, updated_at: new Date().toISOString() }, { onConflict: 'name,day,task' })
    if (error) console.error(error)
  }, [])

  const uploadPhoto = useCallback(async (name, day, task, file) => {
    if (!hasSupabase) { alert('Connect Supabase first to store photos.'); return }
    const ext = (file.name.split('.').pop() || 'jpg').toLowerCase()
    const path = `${name}/day-${day}/${task}-${Date.now()}.${ext}`
    const { error } = await supabase.storage.from('photos').upload(path, file, { upsert: true, cacheControl: '3600' })
    if (error) { alert('Photo upload failed: ' + error.message); return }
    const { data } = supabase.storage.from('photos').getPublicUrl(path)
    await saveEntry(name, day, task, { photo_url: data.publicUrl })
  }, [saveEntry])

  const saveProfile = useCallback(async (name, patch) => {
    setProfiles((prev) => ({ ...prev, [name]: { ...(prev[name] || { name }), ...patch } }))
    if (!hasSupabase) return
    const { error } = await supabase
      .from('profiles')
      .upsert({ name, ...patch, updated_at: new Date().toISOString() }, { onConflict: 'name' })
    if (error) console.error(error)
  }, [])

  /* ---- gates ---- */
  if (!hasSupabase) return <SetupNeeded />
  if (!ready) return <Splash />
  if (!me) return <Onboarding onPick={(who) => { localStorage.setItem('who', who); setMe(who) }} />

  const canEdit = viewPerson === me
  const other = PEOPLE.find((p) => p !== me)

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <span className="flame">🔥</span>
          <span className="brand-title">75&nbsp;Hard</span>
          <span className="brand-sub">together</span>
        </div>
        <div className="topbar-right">
          <button className="ghost-btn" onClick={() => setShowProfile(true)}>Basic info</button>
          <button
            className="who-btn"
            onClick={() => { localStorage.removeItem('who'); setMe(null) }}
            title="Switch person"
          >
            You’re <b style={{ color: `var(--${me.toLowerCase()})` }}>{me}</b>
          </button>
        </div>
      </header>

      <main className="wrap">
        {/* Scoreboard --------------------------------------------------- */}
        <section className="scoreboard">
          {PEOPLE.map((person) => (
            <button
              key={person}
              className={'score-card' + (viewPerson === person ? ' active' : '')}
              data-person={person.toLowerCase()}
              onClick={() => { setViewPerson(person); setViewDay(Math.min(streak(person) + 1, TOTAL_DAYS)) }}
            >
              <div className="score-head">
                <span className="score-name">{profiles[person]?.display_name || person}</span>
                {person === me && <span className="you-tag">you</span>}
              </div>
              <div className="score-big">
                <span className="score-num">{streak(person)}</span>
                <span className="score-slash">/ {TOTAL_DAYS}</span>
              </div>
              <div className="score-label">day streak</div>
              <MiniBar person={person} isDayComplete={isDayComplete} dayTaskCount={dayTaskCount} />
              <div className="score-foot">{daysDone(person)} days completed</div>
            </button>
          ))}
        </section>

        {/* Day navigator ------------------------------------------------ */}
        <section className="daynav">
          <button
            className="round-btn"
            onClick={() => setViewDay((d) => Math.max(1, d - 1))}
            disabled={viewDay <= 1}
            aria-label="Previous day"
          ><Chevron dir="left" width="20" height="20" /></button>

          <div className="daynav-center">
            <div className="daynav-day">Day {viewDay}</div>
            <div className="daynav-person" style={{ color: `var(--${viewPerson.toLowerCase()})` }}>
              {profiles[viewPerson]?.display_name || viewPerson}’s log
              {!canEdit && <span className="ro-tag">read only</span>}
            </div>
          </div>

          <button
            className="round-btn"
            onClick={() => setViewDay((d) => Math.min(TOTAL_DAYS, d + 1))}
            disabled={viewDay >= TOTAL_DAYS}
            aria-label="Next day"
          ><Chevron width="20" height="20" /></button>
        </section>

        {/* Task cards --------------------------------------------------- */}
        <section className="tasks">
          {TASKS.map((task) => (
            <TaskCard
              key={task.key}
              task={task}
              person={viewPerson}
              day={viewDay}
              entry={getEntry(viewPerson, viewDay, task.key)}
              editable={canEdit}
              onToggle={() =>
                saveEntry(viewPerson, viewDay, task.key, {
                  completed: !getEntry(viewPerson, viewDay, task.key).completed,
                })}
              onDetails={(v) => saveEntry(viewPerson, viewDay, task.key, { details: v })}
              onPhoto={(file) => uploadPhoto(viewPerson, viewDay, task.key, file)}
              onView={(url) => setLightbox(url)}
            />
          ))}
        </section>

        {/* The wall ----------------------------------------------------- */}
        <section className="wall-section">
          <div className="wall-head">
            <h2>The wall — <span style={{ color: `var(--${viewPerson.toLowerCase()})` }}>
              {profiles[viewPerson]?.display_name || viewPerson}</span></h2>
            <div className="legend">
              <span><i className="sw sw-full" /> all 6 done</span>
              <span><i className="sw sw-part" /> some done</span>
              <span><i className="sw sw-empty" /> nothing yet</span>
            </div>
          </div>
          <div className="wall">
            {Array.from({ length: TOTAL_DAYS }, (_, i) => i + 1).map((d) => {
              const done = dayTaskCount(viewPerson, d)
              const state = done === 6 ? 'full' : done > 0 ? 'part' : 'empty'
              return (
                <button
                  key={d}
                  className={'cell cell-' + state + (d === viewDay ? ' cell-on' : '')}
                  data-person={viewPerson.toLowerCase()}
                  onClick={() => setViewDay(d)}
                  title={`Day ${d} — ${done}/6`}
                >{d}</button>
              )
            })}
          </div>
        </section>

        <footer className="foot">
          Built for {profiles.Duggu?.display_name || 'Duggu'} &amp; {profiles.Pumpkin?.display_name || 'Pumpkin'}.
          Everything you both log syncs live.
        </footer>
      </main>

      {showProfile && (
        <ProfileModal
          me={me}
          profile={profiles[me] || { name: me }}
          onSave={(patch) => saveProfile(me, patch)}
          onClose={() => setShowProfile(false)}
        />
      )}

      {lightbox && (
        <div className="lightbox" onClick={() => setLightbox(null)}>
          <img src={lightbox} alt="progress" />
        </div>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  MiniBar — 75 tiny ticks under each scoreboard card                 */
/* ------------------------------------------------------------------ */
function MiniBar({ person, isDayComplete, dayTaskCount }) {
  return (
    <div className="minibar" data-person={person.toLowerCase()}>
      {Array.from({ length: TOTAL_DAYS }, (_, i) => i + 1).map((d) => {
        const full = isDayComplete(person, d)
        const part = !full && dayTaskCount(person, d) > 0
        return <i key={d} className={'tick' + (full ? ' t-full' : part ? ' t-part' : '')} />
      })}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  TaskCard                                                           */
/* ------------------------------------------------------------------ */
function TaskCard({ task, person, day, entry, editable, onToggle, onDetails, onPhoto, onView }) {
  const [open, setOpen] = useState(false)
  const [text, setText] = useState(entry.details || '')

  // keep local text in sync when the day/person/remote value changes
  useEffect(() => { setText(entry.details || '') }, [entry.details, person, day, task.key])

  const done = entry.completed
  return (
    <div className={'card' + (done ? ' card-done' : '')} data-person={person.toLowerCase()}>
      <div className="card-main">
        <button
          className={'checkbox' + (done ? ' checked' : '')}
          onClick={editable ? onToggle : undefined}
          disabled={!editable}
          aria-pressed={done}
          aria-label={done ? 'Mark not done' : 'Mark done'}
        >
          {done && <Check width="18" height="18" />}
        </button>

        <div className="card-text">
          <div className="card-label">{task.label}</div>
          <div className="card-hint">{task.hint}</div>
        </div>

        <div className="card-actions">
          {entry.photo_url && (
            <button className="thumb" onClick={() => onView(entry.photo_url)} title="View photo">
              <img src={entry.photo_url} alt="" />
            </button>
          )}
          {editable && (
            <label className="icon-btn" title="Add / change photo">
              <Camera width="18" height="18" />
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={(e) => { const f = e.target.files?.[0]; if (f) onPhoto(f); e.target.value = '' }}
              />
            </label>
          )}
          <button
            className={'icon-btn note-btn' + ((entry.details || open) ? ' has-note' : '')}
            onClick={() => setOpen((o) => !o)}
            title="Notes"
          >
            {open ? '–' : '+'}
          </button>
        </div>
      </div>

      {open && (
        <div className="card-note">
          <textarea
            placeholder={editable ? `Add details for ${task.label.toLowerCase()}…` : 'No notes'}
            value={text}
            readOnly={!editable}
            onChange={(e) => setText(e.target.value)}
            onBlur={() => { if (editable && text !== (entry.details || '')) onDetails(text) }}
            rows={3}
          />
        </div>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Profile / basic info                                               */
/* ------------------------------------------------------------------ */
function ProfileModal({ me, profile, onSave, onClose }) {
  const [form, setForm] = useState({
    display_name: profile.display_name || '',
    start_date: profile.start_date || '',
    why: profile.why || '',
    diet_plan: profile.diet_plan || '',
    book: profile.book || '',
  })
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h2>Your basics, <span style={{ color: `var(--${me.toLowerCase()})` }}>{me}</span></h2>
          <button className="icon-btn" onClick={onClose} aria-label="Close">✕</button>
        </div>

        <label className="field">
          <span>Display name</span>
          <input value={form.display_name} onChange={set('display_name')} placeholder={me} />
        </label>
        <label className="field">
          <span>Start date</span>
          <input type="date" value={form.start_date} onChange={set('start_date')} />
        </label>
        <label className="field">
          <span>Your why</span>
          <textarea rows={2} value={form.why} onChange={set('why')} placeholder="What are you doing this for?" />
        </label>
        <label className="field">
          <span>Diet plan</span>
          <textarea rows={2} value={form.diet_plan} onChange={set('diet_plan')} placeholder="The rules you're following" />
        </label>
        <label className="field">
          <span>Book you're reading</span>
          <input value={form.book} onChange={set('book')} placeholder="Title — author" />
        </label>

        <div className="modal-foot">
          <button className="ghost-btn" onClick={onClose}>Cancel</button>
          <button
            className="primary-btn"
            data-person={me.toLowerCase()}
            onClick={() => { onSave(form); onClose() }}
          >Save</button>
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Onboarding — pick who you are                                      */
/* ------------------------------------------------------------------ */
function Onboarding({ onPick }) {
  return (
    <div className="onboard">
      <div className="onboard-inner">
        <div className="flame big">🔥</div>
        <h1>75 Hard, together</h1>
        <p>Two people. Seventy-five days. No excuses. Who’s checking in?</p>
        <div className="pick-row">
          {PEOPLE.map((p) => (
            <button key={p} className="pick-btn" data-person={p.toLowerCase()} onClick={() => onPick(p)}>
              I’m {p}
            </button>
          ))}
        </div>
        <span className="onboard-note">You can switch anytime from the top bar.</span>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Loading + setup screens                                            */
/* ------------------------------------------------------------------ */
function Splash() {
  return <div className="splash"><div className="flame big pulse">🔥</div><p>Loading your challenge…</p></div>
}

function SetupNeeded() {
  return (
    <div className="onboard">
      <div className="onboard-inner">
        <div className="flame big">🔥</div>
        <h1>Almost there</h1>
        <p>Add your Supabase URL and anon key, then reload. The steps are in the README.</p>
        <code className="envcode">VITE_SUPABASE_URL=…<br />VITE_SUPABASE_ANON_KEY=…</code>
      </div>
    </div>
  )
}
