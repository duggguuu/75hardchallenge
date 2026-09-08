export const PEOPLE = ['Duggu', 'Pumpkin']
export const TOTAL_DAYS = 75

/* The six daily tasks. `kind` picks which card body renders. */
export const TASKS = [
  { key: 'workout1', label: 'Workout 1', hint: '45 minutes', kind: 'exercises', meter: 'Exercises' },
  { key: 'workout2', label: 'Workout 2 · Steps', hint: 'get the steps in — outdoors', kind: 'steps', meter: 'Steps' },
  { key: 'diet', label: 'Diet', hint: 'stick to it — no cheats, no alcohol', kind: 'meals', meter: 'Meals' },
  { key: 'water', label: 'Water', hint: '1 gallon (3.8 L)', kind: 'counter',
    unit: 'ml', step: 250, defaultGoal: 3800, meter: 'Water' },
  { key: 'reading', label: 'Read', hint: '10 pages, non-fiction', kind: 'counter',
    unit: 'pages', step: 1, defaultGoal: 10, meter: 'Pages read' },
  { key: 'photo', label: 'Progress photo', hint: 'one every day', kind: 'photo' },
]

export const TASK_COUNT = TASKS.length
export const MEAL_TYPES = ['Breakfast', 'Lunch', 'Dinner', 'Snack']
export const DEFAULT_STEP_GOAL = 10000

export const keyOf = (name, day, task) => `${name}|${day}|${task}`
export const uid = () => Math.random().toString(36).slice(2, 10)

export const clamp = (n, lo, hi) => Math.min(hi, Math.max(lo, n))
export const pct = (n, d) => (d > 0 ? clamp(Math.round((n / d) * 100), 0, 100) : 0)

/* ---- dates ------------------------------------------------------- */
export const toISODate = (d) => {
  const z = new Date(d.getTime() - d.getTimezoneOffset() * 60000)
  return z.toISOString().slice(0, 10)
}

export const addDays = (iso, n) => {
  const d = new Date(iso + 'T12:00:00')
  d.setDate(d.getDate() + n)
  return toISODate(d)
}

export const prettyDate = (iso) => {
  if (!iso) return null
  const d = new Date(iso + 'T12:00:00')
  if (Number.isNaN(d.getTime())) return null
  return d.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' })
}

export const todayISO = () => toISODate(new Date())
