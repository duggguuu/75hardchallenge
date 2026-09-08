/* Line icons, 24×24 grid. SVG only — no emoji used as UI icons. */

const base = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
  focusable: false,
}

const Icon = ({ size = 18, children, ...p }) => (
  <svg {...base} width={size} height={size} {...p}>{children}</svg>
)

export const Flame = (p) => (
  <Icon {...p}><path d="M12 2.5c.9 3 3 4.2 4.5 6.3A7.5 7.5 0 0 1 12 21.5 7.5 7.5 0 0 1 7.5 8.8C9 6.7 11.1 5.5 12 2.5Z" /><path d="M12 21.5a3.4 3.4 0 0 1-1.6-6.3c.9-.6 1.4-1.4 1.6-2.5.6 1 1.4 1.6 2.2 2.3A3.4 3.4 0 0 1 12 21.5Z" /></Icon>
)
export const Check = (p) => (<Icon strokeWidth={3} {...p}><path d="M20 6 9 17l-5-5" /></Icon>)
export const ChevronLeft = (p) => (<Icon {...p}><path d="m15 18-6-6 6-6" /></Icon>)
export const ChevronRight = (p) => (<Icon {...p}><path d="m9 18 6-6-6-6" /></Icon>)
export const Plus = (p) => (<Icon {...p}><path d="M12 5v14M5 12h14" /></Icon>)
export const Minus = (p) => (<Icon {...p}><path d="M5 12h14" /></Icon>)
export const X = (p) => (<Icon {...p}><path d="M18 6 6 18M6 6l12 12" /></Icon>)
export const Trash = (p) => (
  <Icon {...p}><path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14" /></Icon>
)
export const Camera = (p) => (
  <Icon {...p}><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3Z" /><circle cx="12" cy="13" r="3.2" /></Icon>
)
export const ImageIcon = (p) => (
  <Icon {...p}><rect x="3" y="4" width="18" height="16" rx="2.5" /><circle cx="8.5" cy="9.5" r="1.6" /><path d="m4 17 4.5-4.5 3 3L15 12l5 5" /></Icon>
)
export const Palette = (p) => (
  <Icon {...p}><path d="M12 3a9 9 0 1 0 0 18c1.2 0 1.8-.9 1.8-1.8 0-.6-.3-1-.6-1.4-.3-.4-.5-.7-.5-1.2 0-1 .8-1.7 1.8-1.7h1.6A3.9 3.9 0 0 0 21 11 9 9 0 0 0 12 3Z" /><circle cx="7.5" cy="11" r="1.1" fill="currentColor" stroke="none" /><circle cx="10.5" cy="7.5" r="1.1" fill="currentColor" stroke="none" /><circle cx="15" cy="8" r="1.1" fill="currentColor" stroke="none" /></Icon>
)
export const Sun = (p) => (
  <Icon {...p}><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></Icon>
)
export const Moon = (p) => (<Icon {...p}><path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5Z" /></Icon>)
export const Monitor = (p) => (
  <Icon {...p}><rect x="2.5" y="4" width="19" height="13" rx="2" /><path d="M8.5 21h7M12 17v4" /></Icon>
)
export const Calendar = (p) => (
  <Icon {...p}><rect x="3" y="5" width="18" height="16" rx="2.5" /><path d="M3 10h18M8 3v4M16 3v4" /></Icon>
)
export const Footprints = (p) => (
  <Icon {...p}><path d="M5 15c-.6-1.7-.6-3.4-.4-5C4.9 8 6 7 7.2 7.2 8.4 7.4 9 8.6 8.9 10c-.1 1.4-.6 3.4-.4 5 .1 1.1-.6 1.8-1.7 1.8S5.3 15.9 5 15Z" /><path d="M6.6 19.6c.9.3 2 .2 2.5-.6" /><path d="M15.4 12c-.6-1.7-.6-3.4-.4-5 .3-2 1.4-3 2.6-2.8 1.2.2 1.8 1.4 1.7 2.8-.1 1.4-.6 3.4-.4 5 .1 1.1-.6 1.8-1.7 1.8s-1.5-.9-1.8-1.8Z" /><path d="M17 16.6c.9.3 2 .2 2.5-.6" /></Icon>
)
export const Utensils = (p) => (
  <Icon {...p}><path d="M6 3v7a2.5 2.5 0 0 0 5 0V3M8.5 12.5V21" /><path d="M17.5 3c-1.4 1-2 2.6-2 4.5 0 1.6.6 2.8 2 3.3V21" /></Icon>
)
export const Droplet = (p) => (<Icon {...p}><path d="M12 3.5c3.2 3.4 6 6.2 6 9.4a6 6 0 0 1-12 0c0-3.2 2.8-6 6-9.4Z" /></Icon>)
export const Book = (p) => (
  <Icon {...p}><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H19v15H6.5A2.5 2.5 0 0 0 4 20.5Z" /><path d="M4 20.5A2.5 2.5 0 0 1 6.5 18H19v3H6.5" /></Icon>
)
export const Dumbbell = (p) => (
  <Icon {...p}><path d="M4 9v6M7 7v10M17 7v10M20 9v6M7 12h10" /></Icon>
)
export const Trophy = (p) => (
  <Icon {...p}><path d="M7 4h10v5a5 5 0 0 1-10 0V4Z" /><path d="M7 6H4.5v1.5A3.5 3.5 0 0 0 8 11M17 6h2.5v1.5A3.5 3.5 0 0 1 16 11" /><path d="M9.5 14h5l.6 3.5H8.9L9.5 14ZM7 20.5h10" /></Icon>
)
export const Handshake = (p) => (
  <Icon {...p}><path d="m11 17 2 2 2-2 2 2 3-3-6-6-2 1.5a2 2 0 0 1-2.5-.2L9 10l3-3H8.5L3 12l4 4" /></Icon>
)
export const Sliders = (p) => (
  <Icon {...p}><path d="M4 7h10M18 7h2M4 17h4M12 17h8" /><circle cx="16" cy="7" r="2" /><circle cx="10" cy="17" r="2" /></Icon>
)
export const Pause = (p) => (
  <Icon {...p}><rect x="7" y="5" width="3.5" height="14" rx="1" /><rect x="13.5" y="5" width="3.5" height="14" rx="1" /></Icon>
)
export const User = (p) => (
  <Icon {...p}><circle cx="12" cy="8" r="4" /><path d="M4.5 20a7.5 7.5 0 0 1 15 0" /></Icon>
)

export const TASK_ICONS = {
  workout1: Dumbbell,
  workout2: Footprints,
  diet: Utensils,
  water: Droplet,
  reading: Book,
  photo: Camera,
}
