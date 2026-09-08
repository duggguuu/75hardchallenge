import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { PEOPLE } from '../lib/constants'
import { ease, spring, tapPress } from '../lib/motion'
import { Camera, Check, ImageIcon, Sliders } from './Icons'

/* The top of each person's page: their photo, their name, their headline
   numbers, and — when it's your own page — live photo editing. */
export default function Hero({
  viewPerson, setViewPerson, profiles, me, stats, onUploadCover, onSaveProfile,
}) {
  const profile = profiles[viewPerson] || {}
  const canEdit = viewPerson === me
  const [editing, setEditing] = useState(false)
  const [busy, setBusy] = useState(false)
  const [pos, setPos] = useState(profile.cover_pos ?? 50)
  const fileRef = useRef(null)
  const dirty = useRef(false)

  // follow the stored focal point when it changes elsewhere (or we switch person)
  useEffect(() => {
    dirty.current = false
    setPos(profile.cover_pos ?? 50)
  }, [profile.cover_pos, viewPerson])

  // commit the slider a beat after the user stops dragging
  useEffect(() => {
    if (!dirty.current || !canEdit) return
    const t = setTimeout(() => {
      dirty.current = false
      onSaveProfile(viewPerson, { cover_pos: pos })
    }, 400)
    return () => clearTimeout(t)
  }, [pos, canEdit, viewPerson, onSaveProfile])

  useEffect(() => { setEditing(false) }, [viewPerson])

  const pick = async (file) => {
    if (!file) return
    setBusy(true)
    await onUploadCover(viewPerson, file)
    setBusy(false)
  }

  const s = stats(viewPerson)
  const hasPhoto = !!profile.cover_url
  const name = profile.display_name || viewPerson

  return (
    <motion.section
      className={'hero' + (hasPhoto ? '' : ' no-photo')}
      data-person={viewPerson.toLowerCase()}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={spring}
    >
      <AnimatePresence mode="wait">
        {hasPhoto ? (
          <motion.img
            key={profile.cover_url}
            className="hero-img"
            src={profile.cover_url}
            alt={`${name}'s cover photo`}
            style={{ objectPosition: `50% ${pos}%` }}
            initial={{ opacity: 0, scale: 1.06 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={ease}
          />
        ) : (
          <motion.div key="empty" className="hero-empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} />
        )}
      </AnimatePresence>
      <div className="hero-scrim" />

      <div className="hero-top">
        <div className="person-tabs" role="tablist" aria-label="Whose log to show">
          {PEOPLE.map((p) => (
            <button
              key={p}
              role="tab"
              aria-selected={viewPerson === p}
              className={'person-tab' + (viewPerson === p ? ' on' : '')}
              data-person={p.toLowerCase()}
              onClick={() => setViewPerson(p)}
            >
              {viewPerson === p && (
                <motion.span
                  layoutId="person-tab-bg"
                  className="person-tab-bg"
                  data-person={p.toLowerCase()}
                  transition={spring}
                />
              )}
              {profiles[p]?.display_name || p}
              {p === me && <span className="sr-only"> (you)</span>}
            </button>
          ))}
        </div>

        {canEdit && (
          <div style={{ display: 'flex', gap: 7 }}>
            {hasPhoto && (
              <motion.button
                className="hero-btn"
                whileTap={tapPress}
                onClick={() => setEditing((v) => !v)}
                aria-pressed={editing}
              >
                {editing ? <Check size={15} /> : <Sliders size={15} />}
                {editing ? 'Done' : 'Adjust'}
              </motion.button>
            )}
            <motion.button
              className="hero-btn"
              whileTap={tapPress}
              onClick={() => fileRef.current?.click()}
              disabled={busy}
            >
              <Camera size={15} />
              {busy ? 'Uploading…' : hasPhoto ? 'Change' : 'Add photo'}
            </motion.button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => { pick(e.target.files?.[0]); e.target.value = '' }}
            />
          </div>
        )}
      </div>

      <AnimatePresence>
        {editing && hasPhoto && (
          <motion.div
            className="hero-editor"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={ease}
          >
            <ImageIcon size={15} />
            <label htmlFor="cover-pos">Framing</label>
            <input
              id="cover-pos"
              type="range"
              min="0"
              max="100"
              value={pos}
              onChange={(e) => { dirty.current = true; setPos(Number(e.target.value)) }}
            />
            <span className="num">{pos}%</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="hero-bottom">
        <div style={{ minWidth: 0 }}>
          <h1 className="hero-name">{name}</h1>
          {profile.tagline
            ? <p className="hero-tag">{profile.tagline}</p>
            : profile.why
              ? <p className="hero-tag">{profile.why}</p>
              : null}
        </div>
        <div className="hero-stats">
          <div className="hero-stat"><b className="num">{s.streak}</b><span>streak</span></div>
          <div className="hero-stat"><b className="num">{s.daysDone}</b><span>days done</span></div>
          <div className="hero-stat"><b className="num">{s.percent}%</b><span>overall</span></div>
        </div>
      </div>
    </motion.section>
  )
}
