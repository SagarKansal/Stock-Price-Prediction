import hi from './hi.js'
import bn from './bn.js'
import mr from './mr.js'
import te from './te.js'
import ta from './ta.js'
import gu from './gu.js'
import ur from './ur.js'
import kn from './kn.js'
import ml from './ml.js'
import pa from './pa.js'

// Adding an eleventh Indian language means adding exactly one file here and one
// row in targets.js. Every source language then gets it for free.
export const COURSES = { hi, bn, mr, te, ta, gu, ur, kn, ml, pa }
export const getCourse = (code) => COURSES[code]
