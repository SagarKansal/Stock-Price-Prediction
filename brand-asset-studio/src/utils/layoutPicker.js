// Suggests a starting layout style for a redesign based on the uploaded
// creative's aspect ratio. The user can always override the suggestion.
export function suggestStyleId(width, height) {
  const ratio = width / height

  if (ratio >= 0.8 && ratio <= 1.25) return 'centered'
  if (ratio < 0.8) return 'centered'
  if (ratio >= 1.25 && ratio < 1.7) return 'card'
  if (ratio >= 1.7 && ratio < 2.4) return 'bold'
  return 'split'
}
