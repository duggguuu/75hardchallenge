import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { backdropVariants, modalVariants, tapPress } from '../lib/motion'
import { X } from './Icons'

function Backdrop({ onClose, children, className = 'backdrop' }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])
  return (
    <motion.div
      className={className}
      variants={backdropVariants}
      initial="hidden" animate="show" exit="exit"
      onClick={onClose}
    >
      {children}
    </motion.div>
  )
}

export function ProfileModal({ me, profile, onSave, onClose }) {
  const [form, setForm] = useState({
    display_name: profile.display_name || '',
    tagline: profile.tagline || '',
    start_date: profile.start_date || '',
    why: profile.why || '',
    diet_plan: profile.diet_plan || '',
    book: profile.book || '',
  })
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  return (
    <Backdrop onClose={onClose}>
      <motion.div
        className="modal"
        variants={modalVariants}
        onClick={(e) => e.stopPropagation()}
        role="dialog" aria-modal="true" aria-label="Your basics"
      >
        <div className="modal-head">
          <h2>Your basics, <span style={{ color: `var(--${me.toLowerCase()})` }}>{me}</span></h2>
          <button className="icon-btn" onClick={onClose} aria-label="Close"><X size={16} /></button>
        </div>

        <label className="field">
          <span>Display name</span>
          <input value={form.display_name} onChange={set('display_name')} placeholder={me} />
        </label>
        <label className="field">
          <span>Tagline (shows under your photo)</span>
          <input value={form.tagline} onChange={set('tagline')} placeholder="Day one of the rest of it" />
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
          <button className="btn" onClick={onClose}>Cancel</button>
          <motion.button
            className="btn btn-primary" whileTap={tapPress}
            onClick={() => { onSave(form); onClose() }}
          >Save</motion.button>
        </div>
      </motion.div>
    </Backdrop>
  )
}

export function Lightbox({ url, onClose }) {
  return (
    <Backdrop onClose={onClose} className="lightbox">
      <motion.img
        src={url} alt="Full size"
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        onClick={(e) => e.stopPropagation()}
      />
    </Backdrop>
  )
}
