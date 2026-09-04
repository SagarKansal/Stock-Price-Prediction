// Renders text in a specific Indian script with the right font and direction.
//
// Falling back to a generic sans for Indic text produces tofu boxes or, worse,
// glyphs that render but with wrong conjunct forms. Each script gets its Noto
// family explicitly, and Urdu gets both the Nastaliq face and dir="rtl".

// Each script gets: the Noto web font we request, then the fonts actually
// installed on Windows, macOS and Linux, then a generic. The web font is a
// network dependency, and a learner on a blocked or offline network must still
// see letters rather than tofu boxes - for a reading app that is the
// difference between degraded and useless.
const FONTS = {
  devanagari: [
    "'Noto Sans Devanagari'", "'Nirmala UI'", "'Devanagari Sangam MN'", "Mangal",
    "'Lohit Devanagari'", "'Noto Serif Devanagari'",
  ],
  bengali: [
    "'Noto Sans Bengali'", "'Nirmala UI'", "'Bangla Sangam MN'", "Vrinda",
    "'Lohit Bengali'",
  ],
  tamil: [
    "'Noto Sans Tamil'", "'Nirmala UI'", "'Tamil Sangam MN'", "Latha",
    "'Lohit Tamil'",
  ],
  telugu: [
    "'Noto Sans Telugu'", "'Nirmala UI'", "'Telugu Sangam MN'", "Gautami",
    "'Lohit Telugu'",
  ],
  kannada: [
    "'Noto Sans Kannada'", "'Nirmala UI'", "'Kannada Sangam MN'", "Tunga",
    "'Lohit Kannada'",
  ],
  malayalam: [
    "'Noto Sans Malayalam'", "'Nirmala UI'", "'Malayalam Sangam MN'", "Kartika",
    "'Lohit Malayalam'",
  ],
  gujarati: [
    "'Noto Sans Gujarati'", "'Nirmala UI'", "'Gujarati Sangam MN'", "Shruti",
    "'Lohit Gujarati'",
  ],
  gurmukhi: [
    "'Noto Sans Gurmukhi'", "'Nirmala UI'", "'Gurmukhi MN'", "Raavi",
    "'Lohit Gurmukhi'",
  ],
  nastaliq: [
    "'Noto Nastaliq Urdu'", "'Jameel Noori Nastaleeq'", "'Urdu Typesetting'",
    "'Geeza Pro'", "'Noto Naskh Arabic'",
  ],
}

const RTL = new Set(['nastaliq'])

export const fontFor = (script) =>
  [...(FONTS[script] || []), "'Noto Sans'", 'ui-sans-serif', 'system-ui', 'sans-serif'].join(', ')

export default function TargetText({ text, script, size = '', className = '', style = {} }) {
  if (!text) return null
  const rtl = RTL.has(script)
  return (
    <span
      className={`target ${size} ${className}`.trim()}
      dir={rtl ? 'rtl' : 'ltr'}
      lang={script}
      style={{ fontFamily: fontFor(script), ...style }}
    >
      {text}
    </span>
  )
}

/** Target word plus its transliteration, the pairing used all over the app. */
export function Word({ text, latn, script, size = '', showLatn = true }) {
  return (
    <span style={{ display: 'inline-flex', flexDirection: 'column', gap: 1, minWidth: 0 }}>
      <TargetText text={text} script={script} size={size} />
      {showLatn && latn ? <span className="latn">{latn}</span> : null}
    </span>
  )
}
