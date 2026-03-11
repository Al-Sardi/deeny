/**
 * dateUtils.js — Local-timezone date helpers.
 *
 * IMPORTANT: Always use these instead of toISOString().split('T')[0],
 * which returns UTC and gives the wrong date near midnight.
 */

/** Return today's local date as YYYY-MM-DD. */
export function getToday() {
  return formatLocalDate(new Date())
}

/** Return yesterday's local date as YYYY-MM-DD. */
export function getYesterday() {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  return formatLocalDate(d)
}

/** Format any Date object as YYYY-MM-DD in local timezone. */
export function formatLocalDate(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
