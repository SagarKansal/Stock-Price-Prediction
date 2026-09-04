// Spaced repetition, deliberately small.
//
// A full SM-2 implementation is overkill for a vocabulary of a hundred words
// and it produces schedules learners find opaque. This is a six-rung ladder:
// answer right and you climb, answer wrong and you drop two rungs. The
// interval is a pure function of the rung.

export const RUNGS = [
  { name: 'new',       ms: 0 },
  { name: 'seen',      ms: 10 * 60 * 1000 },
  { name: 'learning',  ms: 24 * 60 * 60 * 1000 },
  { name: 'familiar',  ms: 3 * 24 * 60 * 60 * 1000 },
  { name: 'strong',    ms: 7 * 24 * 60 * 60 * 1000 },
  { name: 'solid',     ms: 21 * 24 * 60 * 60 * 1000 },
  { name: 'burned in', ms: 60 * 24 * 60 * 60 * 1000 },
]

export const MAX_RUNG = RUNGS.length - 1

export const newItem = () => ({ rung: 0, due: 0, seen: 0, right: 0, wrong: 0, last: 0 })

export function review(item, correct, now = Date.now()) {
  const it = { ...(item || newItem()) }
  it.seen += 1
  it.last = now
  if (correct) {
    it.right += 1
    it.rung = Math.min(MAX_RUNG, it.rung + 1)
  } else {
    it.wrong += 1
    it.rung = Math.max(0, it.rung - 2)
  }
  it.due = now + RUNGS[it.rung].ms
  return it
}

// "Due" means seen before and now overdue. A word you have never met is NEW,
// not due: conflating the two made a fresh course announce 113 items to review,
// which is both wrong and demoralising.
export const isDue = (item, now = Date.now()) => Boolean(item) && item.due <= now
export const isNew = (item) => !item

export function dueCount(state, ids, now = Date.now()) {
  return ids.filter((id) => isDue(state[id], now)).length
}

export function newCount(state, ids) {
  return ids.filter((id) => isNew(state[id])).length
}

/**
 * Pick what to study: everything overdue first, then new material, capped.
 * Overdue items come first because forgetting compounds; new words can wait a
 * day, a half-forgotten word cannot.
 */
export function selectStudy(state, ids, limit, now = Date.now()) {
  const overdue = ids
    .filter((id) => state[id] && state[id].due <= now)
    .sort((a, b) => state[a].due - state[b].due)
  const fresh = ids.filter((id) => !state[id])
  return [...overdue, ...fresh].slice(0, limit)
}

/** Aggregate progress for the stats bar. */
export function summarise(state, ids) {
  let started = 0
  let strong = 0
  for (const id of ids) {
    const it = state[id]
    if (!it) continue
    started += 1
    if (it.rung >= 4) strong += 1
  }
  return { started, strong, total: ids.length, due: dueCount(state, ids) }
}
