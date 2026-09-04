// Persistence. Per (target, source) pair, in localStorage.
//
// Wrapped in try/catch throughout: private windows, blocked site data and
// embedded contexts all make these calls throw, and a language app that
// crashes because it cannot save a streak is worse than one that forgets.

const KEY = 'bhasha.v1'

const blank = () => ({ courses: {}, settings: { source: 'en', target: null, audio: true } })

export function load() {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return blank()
    const parsed = JSON.parse(raw)
    return { ...blank(), ...parsed }
  } catch {
    return blank()
  }
}

export function save(state) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state))
    return true
  } catch {
    return false
  }
}

export const pairKey = (target, source) => `${target}<-${source}`

export function courseState(state, target, source) {
  return state.courses[pairKey(target, source)] || { items: {}, xp: 0, streak: 0, lastDay: null, lessons: 0 }
}

const dayStamp = (ts = Date.now()) => new Date(ts).toISOString().slice(0, 10)

/** Streak counts consecutive calendar days with at least one finished lesson. */
export function bumpStreak(course, now = Date.now()) {
  const today = dayStamp(now)
  if (course.lastDay === today) return course
  const yesterday = dayStamp(now - 86400000)
  return {
    ...course,
    streak: course.lastDay === yesterday ? course.streak + 1 : 1,
    lastDay: today,
  }
}

export function isStreakStale(course, now = Date.now()) {
  if (!course.lastDay) return false
  return course.lastDay !== dayStamp(now) && course.lastDay !== dayStamp(now - 86400000)
}
