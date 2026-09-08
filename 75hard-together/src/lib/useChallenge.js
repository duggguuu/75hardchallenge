import { useCallback, useEffect, useMemo, useState } from 'react'
import { supabase, hasSupabase } from '../supabaseClient'
import {
  PEOPLE, TASKS, TASK_COUNT, TOTAL_DAYS, DEFAULT_STEP_GOAL,
  keyOf, clamp, pct, addDays, todayISO,
} from './constants'

const EMPTY_ENTRY = { completed: false, details: '', photo_url: null, data: {} }
const EMPTY_DAY = { date: null, is_exception: false, note: '' }

/* A missing column / table means the v2 migration hasn't been run yet.
   We surface that instead of letting the app fail silently. */
const isSchemaError = (error) =>
  !!error && /column|relation|schema cache/i.test(error.message || '')

export function useChallenge() {
  const [entries, setEntries] = useState([])
  const [profiles, setProfiles] = useState({})
  const [days, setDays] = useState([])
  const [ready, setReady] = useState(false)
  const [needsMigration, setNeedsMigration] = useState(false)

  /* ---------------- load + realtime ---------------- */
  const fetchAll = useCallback(async () => {
    if (!hasSupabase) { setReady(true); return }
    let eRes, pRes, dRes
    try {
      [eRes, pRes, dRes] = await Promise.all([
        supabase.from('entries').select('*'),
        supabase.from('profiles').select('*'),
        supabase.from('days').select('*'),
      ])
    } catch (err) {
      // a dropped connection shouldn't strand us on the splash screen
      console.error('fetchAll', err)
      setReady(true)
      return
    }

    if (eRes.data) setEntries(eRes.data)
    if (pRes.data) {
      const map = {}
      pRes.data.forEach((row) => { map[row.name] = row })
      setProfiles(map)
    }
    if (dRes.data) setDays(dRes.data)

    // v2 schema probes
    if (isSchemaError(dRes.error)) setNeedsMigration(true)
    if (eRes.data?.length && !('data' in eRes.data[0])) setNeedsMigration(true)
    if (pRes.data?.length && !('cover_url' in pRes.data[0])) setNeedsMigration(true)

    setReady(true)
  }, [])

  useEffect(() => {
    fetchAll()
    if (!hasSupabase) return
    const channel = supabase
      .channel('room-75hard')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'entries' }, fetchAll)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, fetchAll)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'days' }, fetchAll)
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [fetchAll])

  /* ---------------- lookups ---------------- */
  const entryMap = useMemo(() => {
    const m = new Map()
    entries.forEach((r) => m.set(keyOf(r.name, r.day, r.task), r))
    return m
  }, [entries])

  const dayMap = useMemo(() => {
    const m = new Map()
    days.forEach((r) => m.set(`${r.name}|${r.day}`, r))
    return m
  }, [days])

  const getEntry = useCallback((name, day, task) => {
    const row = entryMap.get(keyOf(name, day, task))
    if (!row) return EMPTY_ENTRY
    return { ...row, data: row.data || {} }
  }, [entryMap])

  const getDay = useCallback((name, day) => dayMap.get(`${name}|${day}`) || EMPTY_DAY, [dayMap])

  const isException = useCallback((name, day) => !!getDay(name, day).is_exception, [getDay])

  /* The calendar date for a day: an explicit override, otherwise
     counted forward from that person's start date. */
  const dateFor = useCallback((name, day) => {
    const explicit = getDay(name, day).date
    if (explicit) return explicit
    const start = profiles[name]?.start_date
    return start ? addDays(start, day - 1) : null
  }, [getDay, profiles])

  /* The furthest day this person has actually touched — so reopening the
     app resumes where they were, not at the first unfinished day. */
  const lastActiveDay = useCallback((name) => {
    let last = 0
    entries.forEach((r) => {
      if (r.name !== name || r.day <= last) return
      const d = r.data || {}
      const touched = r.completed || r.details || r.photo_url ||
        d.exercises?.length || d.meals?.length || d.steps || d.value
      if (touched) last = r.day
    })
    days.forEach((r) => { if (r.name === name && r.day > last && (r.date || r.is_exception)) last = r.day })
    return last
  }, [entries, days])

  const todayDayNumber = useCallback((name) => {
    const start = profiles[name]?.start_date
    if (!start) return null
    const ms = new Date(todayISO() + 'T12:00:00') - new Date(start + 'T12:00:00')
    const n = Math.floor(ms / 86400000) + 1
    return n >= 1 && n <= TOTAL_DAYS ? n : null
  }, [profiles])

  /* ---------------- progress ---------------- */

  /* Per-task progress. Where a task has a countable target (steps,
     water, pages, exercises) the bar reflects it; otherwise it simply
     mirrors the checkbox. */
  const taskProgress = useCallback((name, day, task) => {
    const e = getEntry(name, day, task.key)
    const d = e.data || {}
    const binary = { done: e.completed ? 1 : 0, total: 1, ratio: e.completed ? 1 : 0 }

    if (task.kind === 'exercises') {
      const list = d.exercises || []
      if (!list.length) return binary
      const done = list.filter((x) => x.done).length
      return { done, total: list.length, ratio: done / list.length, label: `${done}/${list.length} exercises` }
    }
    if (task.kind === 'steps') {
      const goal = d.goal || DEFAULT_STEP_GOAL
      const steps = d.steps || 0
      return { done: steps, total: goal, ratio: clamp(steps / goal, 0, 1), label: `${steps.toLocaleString()} / ${goal.toLocaleString()} steps` }
    }
    if (task.kind === 'counter') {
      const goal = d.goal || task.defaultGoal
      const val = d.value || 0
      return { done: val, total: goal, ratio: clamp(val / goal, 0, 1), label: `${val} / ${goal} ${task.unit}` }
    }
    if (task.kind === 'meals') {
      const meals = d.meals || []
      return { ...binary, label: meals.length ? `${meals.length} logged` : 'nothing logged' }
    }
    return binary
  }, [getEntry])

  const dayTaskCount = useCallback(
    (name, day) => TASKS.reduce((n, t) => n + (getEntry(name, day, t.key).completed ? 1 : 0), 0),
    [getEntry],
  )

  const isDayComplete = useCallback(
    (name, day) => dayTaskCount(name, day) === TASK_COUNT,
    [dayTaskCount],
  )

  /* Exception days are skipped: they neither break a streak nor count
     toward it. Everything else follows the real 75 Hard rule. */
  const streak = useCallback((name) => {
    let s = 0
    for (let d = 1; d <= TOTAL_DAYS; d++) {
      if (isException(name, d)) continue
      if (isDayComplete(name, d)) s++
      else break
    }
    return s
  }, [isDayComplete, isException])

  const stats = useCallback((name) => {
    let daysDone = 0
    let tasksDone = 0
    let exceptions = 0
    for (let d = 1; d <= TOTAL_DAYS; d++) {
      if (isException(name, d)) { exceptions++; continue }
      const n = dayTaskCount(name, d)
      tasksDone += n
      if (n === TASK_COUNT) daysDone++
    }
    const activeDays = TOTAL_DAYS - exceptions
    return {
      daysDone,
      tasksDone,
      exceptions,
      activeDays,
      streak: streak(name),
      percent: pct(tasksDone, activeDays * TASK_COUNT),
      daysPercent: pct(daysDone, activeDays),
    }
  }, [dayTaskCount, isException, streak])

  /* Head to head. Days completed decides it; total tasks breaks a tie. */
  const standings = useMemo(() => {
    const rows = PEOPLE.map((name) => ({ name, ...stats(name) }))
    const [a, b] = rows
    let leader = null
    if (a.daysDone !== b.daysDone) leader = a.daysDone > b.daysDone ? a.name : b.name
    else if (a.tasksDone !== b.tasksDone) leader = a.tasksDone > b.tasksDone ? a.name : b.name
    const totalTasks = a.tasksDone + b.tasksDone
    return {
      rows,
      leader,
      tied: leader === null,
      shareA: totalTasks ? a.tasksDone / totalTasks : 0.5,
    }
  }, [stats])

  /* ---------------- writes ---------------- */
  const saveEntry = useCallback(async (name, day, task, patch) => {
    setEntries((prev) => {
      const i = prev.findIndex((r) => r.name === name && r.day === day && r.task === task)
      if (i === -1) return [...prev, { ...EMPTY_ENTRY, name, day, task, ...patch }]
      const next = [...prev]
      next[i] = { ...next[i], ...patch }
      return next
    })
    if (!hasSupabase) return
    const { error } = await supabase.from('entries').upsert(
      { name, day, task, ...patch, updated_at: new Date().toISOString() },
      { onConflict: 'name,day,task' },
    )
    if (error) {
      if (isSchemaError(error)) setNeedsMigration(true)
      console.error('saveEntry', error)
    }
  }, [])

  /* Merge into the jsonb payload without clobbering sibling keys. */
  const patchData = useCallback((name, day, task, partial, extra = {}) => {
    const current = getEntry(name, day, task).data || {}
    const merged = { ...current, ...partial }
    return saveEntry(name, day, task, { data: merged, ...extra })
  }, [getEntry, saveEntry])

  const saveDay = useCallback(async (name, day, patch) => {
    setDays((prev) => {
      const i = prev.findIndex((r) => r.name === name && r.day === day)
      if (i === -1) return [...prev, { ...EMPTY_DAY, name, day, ...patch }]
      const next = [...prev]
      next[i] = { ...next[i], ...patch }
      return next
    })
    if (!hasSupabase) return
    const { error } = await supabase.from('days').upsert(
      { name, day, ...patch, updated_at: new Date().toISOString() },
      { onConflict: 'name,day' },
    )
    if (error) {
      if (isSchemaError(error)) setNeedsMigration(true)
      console.error('saveDay', error)
    }
  }, [])

  const saveProfile = useCallback(async (name, patch) => {
    setProfiles((prev) => ({ ...prev, [name]: { ...(prev[name] || { name }), ...patch } }))
    if (!hasSupabase) return
    const { error } = await supabase.from('profiles').upsert(
      { name, ...patch, updated_at: new Date().toISOString() },
      { onConflict: 'name' },
    )
    if (error) {
      if (isSchemaError(error)) setNeedsMigration(true)
      console.error('saveProfile', error)
    }
  }, [])

  /* Uploads the file and returns its public URL (or null). */
  const uploadFile = useCallback(async (path, file) => {
    if (!hasSupabase) { alert('Connect Supabase first to store photos.'); return null }
    const { error } = await supabase.storage
      .from('photos')
      .upload(path, file, { upsert: true, cacheControl: '3600' })
    if (error) { alert('Photo upload failed: ' + error.message); return null }
    return supabase.storage.from('photos').getPublicUrl(path).data.publicUrl
  }, [])

  const extOf = (file) => (file.name.split('.').pop() || 'jpg').toLowerCase()

  const uploadTaskPhoto = useCallback(async (name, day, task, file) => {
    const url = await uploadFile(`${name}/day-${day}/${task}-${Date.now()}.${extOf(file)}`, file)
    if (url) await saveEntry(name, day, task, { photo_url: url })
  }, [uploadFile, saveEntry])

  const uploadCover = useCallback(async (name, file) => {
    const url = await uploadFile(`${name}/cover-${Date.now()}.${extOf(file)}`, file)
    if (url) await saveProfile(name, { cover_url: url })
  }, [uploadFile, saveProfile])

  return {
    ready, needsMigration, profiles, entries, days,
    getEntry, getDay, dateFor, isException, todayDayNumber, lastActiveDay,
    taskProgress, dayTaskCount, isDayComplete, streak, stats, standings,
    saveEntry, patchData, saveDay, saveProfile,
    uploadFile, uploadTaskPhoto, uploadCover,
  }
}
