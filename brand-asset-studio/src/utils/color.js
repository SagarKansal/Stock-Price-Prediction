// Small color helpers used to keep generated assets readable regardless of
// which brand colors the user picks.

export function hexToRgb(hex) {
  const clean = hex.replace('#', '')
  const full =
    clean.length === 3
      ? clean
          .split('')
          .map((c) => c + c)
          .join('')
      : clean
  const int = parseInt(full, 16)
  return {
    r: (int >> 16) & 255,
    g: (int >> 8) & 255,
    b: int & 255,
  }
}

function relativeLuminance({ r, g, b }) {
  const [rs, gs, bs] = [r, g, b].map((v) => {
    const c = v / 255
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  })
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
}

// Returns '#0b0d12' or '#ffffff' depending on which reads better on the given background.
export function readableTextColor(hexBg) {
  try {
    const luminance = relativeLuminance(hexToRgb(hexBg))
    return luminance > 0.55 ? '#0b0d12' : '#ffffff'
  } catch {
    return '#ffffff'
  }
}

// Mixes two hex colors for gradient / tint helpers.
export function mixHex(hexA, hexB, weight = 0.5) {
  const a = hexToRgb(hexA)
  const b = hexToRgb(hexB)
  const mix = (x, y) => Math.round(x * (1 - weight) + y * weight)
  const r = mix(a.r, b.r)
  const g = mix(a.g, b.g)
  const bl = mix(a.b, b.b)
  return `#${[r, g, bl].map((v) => v.toString(16).padStart(2, '0')).join('')}`
}

export function withAlpha(hex, alpha) {
  const { r, g, b } = hexToRgb(hex)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}
