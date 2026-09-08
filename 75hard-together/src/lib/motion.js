/* Shared Framer Motion presets, so timing stays consistent app-wide.
   Motion conveys meaning here: entrances rise, exits fall away faster
   than they arrive, and anything the user completes gets a spring. */

export const spring = { type: 'spring', stiffness: 320, damping: 30, mass: 0.9 }
export const springSoft = { type: 'spring', stiffness: 180, damping: 24 }
export const springPop = { type: 'spring', stiffness: 520, damping: 18, mass: 0.7 }
export const ease = { duration: 0.28, ease: [0.22, 0.61, 0.36, 1] }
export const easeOut = { duration: 0.18, ease: [0.4, 0, 1, 1] }

/* staggered section entrance */
export const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.055, delayChildren: 0.04 } },
}

export const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: spring },
}

export const fadeIn = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: ease },
}

/* rows that get added and removed (exercises, meals) */
export const rowVariants = {
  hidden: { opacity: 0, y: -6, scale: 0.97 },
  show: { opacity: 1, y: 0, scale: 1, transition: spring },
  exit: { opacity: 0, x: 24, scale: 0.95, transition: easeOut },
}

/* modals and popovers */
export const backdropVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.18 } },
  exit: { opacity: 0, transition: { duration: 0.14 } },
}

export const modalVariants = {
  hidden: { opacity: 0, y: 18, scale: 0.96 },
  show: { opacity: 1, y: 0, scale: 1, transition: spring },
  exit: { opacity: 0, y: 10, scale: 0.97, transition: easeOut },
}

export const popVariants = {
  hidden: { opacity: 0, y: -8, scale: 0.96 },
  show: { opacity: 1, y: 0, scale: 1, transition: { ...spring, stiffness: 420 } },
  exit: { opacity: 0, y: -6, scale: 0.97, transition: easeOut },
}

/* the day panel slides in the direction you navigated */
export const dayVariants = {
  hidden: (dir) => ({ opacity: 0, x: dir > 0 ? 34 : -34 }),
  show: { opacity: 1, x: 0, transition: spring },
  exit: (dir) => ({ opacity: 0, x: dir > 0 ? -26 : 26, transition: easeOut }),
}

export const tapPress = { scale: 0.97 }
export const liftHover = { y: -2 }
