import { LEVELS, LEVEL_BY_ID, levelIndex } from './levels.js'
import l0 from './l0.js'
import l1 from './l1.js'
import l2 from './l2.js'
import l3 from './l3.js'
import l4 from './l4.js'
import l5 from './l5.js'
import { VERBS, TENSES, PRONOUN_SLOTS } from './verbs.js'

export const PACKS = { l0, l1, l2, l3, l4, l5 }
export const DEEP_MR = {
  code: 'mr',
  review: 'draft',
  levels: LEVELS,
  packs: PACKS,
  verbs: VERBS,
  tenses: TENSES,
  pronounSlots: PRONOUN_SLOTS,
}
export { LEVELS, LEVEL_BY_ID, levelIndex, VERBS, TENSES, PRONOUN_SLOTS }
export const packFor = (levelId) => PACKS[levelId]
