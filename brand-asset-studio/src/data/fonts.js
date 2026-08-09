// Curated Google Fonts. Each has a display name + the family name used in CSS/Google Fonts URLs.
export const FONT_OPTIONS = [
  { name: 'Inter', weights: [400, 500, 600, 700, 800] },
  { name: 'Space Grotesk', weights: [400, 500, 600, 700] },
  { name: 'Poppins', weights: [400, 500, 600, 700, 800] },
  { name: 'Playfair Display', weights: [400, 600, 700, 800] },
  { name: 'Montserrat', weights: [400, 500, 600, 700, 800] },
  { name: 'DM Sans', weights: [400, 500, 700] },
  { name: 'Roboto Slab', weights: [400, 500, 700] },
  { name: 'Merriweather', weights: [400, 700, 900] },
  { name: 'Oswald', weights: [400, 500, 600, 700] },
  { name: 'Lora', weights: [400, 500, 600, 700] },
]

const loadedFamilies = new Set()

// Injects a Google Fonts <link> tag for the requested family, once per family.
export function ensureFontLoaded(familyName) {
  const font = FONT_OPTIONS.find((f) => f.name === familyName)
  if (!font || loadedFamilies.has(familyName)) return

  const weights = font.weights.join(';')
  const href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(
    familyName
  )}:wght@${weights}&display=swap`

  const link = document.createElement('link')
  link.rel = 'stylesheet'
  link.href = href
  document.head.appendChild(link)
  loadedFamilies.add(familyName)
}
