// Text to speech.
//
// Browsers ship voices for a small and unpredictable set of Indian languages.
// Rather than firing an utterance into silence and letting the learner think
// they are deaf, this module reports honestly whether a voice exists, and the
// UI hides listening exercises when it does not.

let cache = null

function voices() {
  if (typeof window === 'undefined' || !window.speechSynthesis) return []
  if (cache && cache.length) return cache
  cache = window.speechSynthesis.getVoices() || []
  return cache
}

export function refreshVoices() {
  cache = null
  return voices()
}

export function onVoicesReady(cb) {
  if (typeof window === 'undefined' || !window.speechSynthesis) return () => {}
  const handler = () => {
    refreshVoices()
    cb(voices())
  }
  window.speechSynthesis.addEventListener('voiceschanged', handler)
  // Some engines populate synchronously, some only after the event.
  if (voices().length) cb(voices())
  return () => window.speechSynthesis.removeEventListener('voiceschanged', handler)
}

export function voiceFor(locale) {
  const list = voices()
  if (!list.length) return null
  const lang = locale.toLowerCase()
  const base = lang.split('-')[0]
  return (
    list.find((v) => v.lang && v.lang.toLowerCase() === lang) ||
    list.find((v) => v.lang && v.lang.toLowerCase().startsWith(base)) ||
    null
  )
}

export const hasVoice = (locale) => Boolean(voiceFor(locale))

export function speak(text, locale, rate = 0.85) {
  if (typeof window === 'undefined' || !window.speechSynthesis) return false
  const voice = voiceFor(locale)
  if (!voice) return false
  window.speechSynthesis.cancel()
  const u = new SpeechSynthesisUtterance(text)
  u.voice = voice
  u.lang = voice.lang
  u.rate = rate // slower than default: learners need the consonant clusters
  window.speechSynthesis.speak(u)
  return true
}
