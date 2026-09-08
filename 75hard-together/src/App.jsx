import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { hasSupabase } from './supabaseClient'
import { useChallenge } from './lib/useChallenge'
import { PEOPLE, TASKS, TOTAL_DAYS, clamp } from './lib/constants'
import { dayVariants, fadeUp, stagger, tapPress } from './lib/motion'
import { Flame, User } from './components/Icons'
import ThemePicker from './components/ThemePicker'
import Hero from './components/Hero'
import Standings from './components/Standings'
import DayNav from './components/DayNav'
import TaskCard from './components/TaskCard'
import Wall from './components/Wall'
import { Lightbox, ProfileModal } from './components/Modals'
import { MigrationBanner, Onboarding, SetupNeeded, Splash } from './components/Screens'

export default function App() {
  const [me, setMe] = useState(() => {
    try { return localStorage.getItem('who') } catch { return null }
  })
  const [viewPerson, setViewPerson] = useState(me || PEOPLE[0])
  const [viewDay, setViewDay] = useState(1)
  const [dir, setDir] = useState(1)
  const [showProfile, setShowProfile] = useState(false)
  const [lightbox, setLightbox] = useState(null)
  const landed = useRef(false)

  const c = useChallenge()
  const {
    ready, needsMigration, profiles, getEntry, getDay, dateFor, isException,
    todayDayNumber, lastActiveDay, taskProgress, dayTaskCount, streak, stats, standings,
    saveEntry, patchData, saveDay, saveProfile, uploadFile, uploadTaskPhoto, uploadCover,
  } = c

  /* Land on a sensible day once, the first time we know who you are.
     After that the day is yours to move — nothing here ever pulls it back. */
  useEffect(() => {
    if (!me || !ready || landed.current) return
    landed.current = true
    setViewPerson(me)
    // today's date wins; otherwise resume at the furthest day you've touched
    const resume = Math.max(lastActiveDay(me), streak(me) + 1)
    setViewDay(todayDayNumber(me) ?? clamp(resume, 1, TOTAL_DAYS))
  }, [me, ready, todayDayNumber, lastActiveDay, streak])

  /* Free navigation: every day is reachable, complete or not. */
  const go = useCallback((delta) => {
    setDir(delta)
    setViewDay((d) => clamp(d + delta, 1, TOTAL_DAYS))
  }, [])

  const jumpTo = useCallback((d) => {
    setDir(d >= viewDay ? 1 : -1)
    setViewDay(clamp(d, 1, TOTAL_DAYS))
  }, [viewDay])

  /* Arrow keys move between days too. */
  useEffect(() => {
    const onKey = (e) => {
      if (e.target.matches('input, textarea, select')) return
      if (e.key === 'ArrowLeft') go(-1)
      if (e.key === 'ArrowRight') go(1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [go])

  if (!hasSupabase) return <SetupNeeded />
  if (!ready) return <Splash />
  if (!me) return <Onboarding onPick={(who) => {
    try { localStorage.setItem('who', who) } catch { /* private mode */ }
    setMe(who)
  }} />

  const canEdit = viewPerson === me
  const dayInfo = getDay(viewPerson, viewDay)
  const doneCount = dayTaskCount(viewPerson, viewDay)
  const personName = profiles[viewPerson]?.display_name || viewPerson

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark"><Flame size={18} /></span>
          <span className="brand-title">75 Hard</span>
          <span className="brand-sub">together</span>
        </div>
        <div className="topbar-right">
          <ThemePicker />
          <motion.button
            className="btn btn-sm" whileTap={tapPress}
            onClick={() => setShowProfile(true)}
          >Basics</motion.button>
          <motion.button
            className="btn btn-sm" whileTap={tapPress}
            onClick={() => {
              try { localStorage.removeItem('who') } catch { /* private mode */ }
              landed.current = false
              setMe(null)
            }}
            title="Switch person"
          >
            <User size={14} />
            <b style={{ color: `var(--${me.toLowerCase()})` }}>{me}</b>
          </motion.button>
        </div>
      </header>

      <motion.main className="wrap" variants={stagger} initial="hidden" animate="show">
        {needsMigration && <MigrationBanner />}

        <Hero
          viewPerson={viewPerson}
          setViewPerson={setViewPerson}
          profiles={profiles}
          me={me}
          stats={stats}
          onUploadCover={uploadCover}
          onSaveProfile={saveProfile}
        />

        <motion.div variants={fadeUp}>
          <Standings standings={standings} profiles={profiles} onPick={setViewPerson} />
        </motion.div>

        <motion.div variants={fadeUp}>
          <DayNav
            day={viewDay}
            go={go}
            jumpTo={jumpTo}
            person={viewPerson}
            dateFor={dateFor}
            dayInfo={dayInfo}
            onSaveDay={(patch) => saveDay(viewPerson, viewDay, patch)}
            canEdit={canEdit}
            doneCount={doneCount}
            todayDay={todayDayNumber(viewPerson)}
          />
        </motion.div>

        {!canEdit && (
          <motion.p variants={fadeUp} style={{ margin: 0, fontSize: 13, color: 'var(--ink-3)', textAlign: 'center' }}>
            You’re looking at {personName}’s log — read only. Switch to your own tab to log anything.
          </motion.p>
        )}

        <AnimatePresence mode="wait" custom={dir}>
          <motion.section
            key={`${viewPerson}-${viewDay}`}
            className="tasks"
            custom={dir}
            variants={dayVariants}
            initial="hidden" animate="show" exit="exit"
          >
            {TASKS.map((task) => (
              <TaskCard
                key={task.key}
                task={task}
                person={viewPerson}
                day={viewDay}
                entry={getEntry(viewPerson, viewDay, task.key)}
                progress={taskProgress(viewPerson, viewDay, task)}
                editable={canEdit}
                onToggle={() => saveEntry(viewPerson, viewDay, task.key, {
                  completed: !getEntry(viewPerson, viewDay, task.key).completed,
                })}
                onDetails={(v) => saveEntry(viewPerson, viewDay, task.key, { details: v })}
                onData={(partial, extra) => patchData(viewPerson, viewDay, task.key, partial, extra)}
                onPhoto={(file) => uploadTaskPhoto(viewPerson, viewDay, task.key, file)}
                onUpload={(slug, file) => uploadFile(
                  `${viewPerson}/day-${viewDay}/${slug}-${Date.now()}.${(file.name.split('.').pop() || 'jpg').toLowerCase()}`,
                  file,
                )}
                onView={setLightbox}
              />
            ))}
          </motion.section>
        </AnimatePresence>

        <motion.div variants={fadeUp}>
          <Wall
            person={viewPerson}
            name={personName}
            viewDay={viewDay}
            jumpTo={jumpTo}
            dayTaskCount={dayTaskCount}
            isException={isException}
            stats={stats}
          />
        </motion.div>

        <motion.footer className="foot" variants={fadeUp}>
          Built for {profiles.Duggu?.display_name || 'Duggu'} &amp; {profiles.Pumpkin?.display_name || 'Pumpkin'}.
          Everything you both log syncs live.
        </motion.footer>
      </motion.main>

      <AnimatePresence>
        {showProfile && (
          <ProfileModal
            key="profile"
            me={me}
            profile={profiles[me] || { name: me }}
            onSave={(patch) => saveProfile(me, patch)}
            onClose={() => setShowProfile(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {lightbox && <Lightbox key="lightbox" url={lightbox} onClose={() => setLightbox(null)} />}
      </AnimatePresence>
    </div>
  )
}
