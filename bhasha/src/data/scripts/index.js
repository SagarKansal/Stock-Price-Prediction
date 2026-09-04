import { BRAHMIC } from './brahmic.js'
import { PERSO } from './perso.js'

export const SCRIPTS = { ...BRAHMIC, ...PERSO }
export const getScript = (id) => SCRIPTS[id]
