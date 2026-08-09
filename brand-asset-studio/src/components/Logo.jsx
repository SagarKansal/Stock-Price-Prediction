import React from 'react'
import { readableTextColor } from '../utils/color.js'

// Renders the uploaded logo image, or falls back to a monogram badge
// generated from the brand name so every template still looks intentional
// before a user uploads real artwork.
export default function Logo({ brand, size = 96, shape = 'circle', badgeColor }) {
  const bg = badgeColor || brand.accentColor
  const textColor = readableTextColor(bg)
  const radius = shape === 'circle' ? '50%' : size * 0.22

  const containerStyle = {
    width: size,
    height: size,
    borderRadius: radius,
    background: brand.logoDataUrl ? '#ffffff' : bg,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    flexShrink: 0,
    boxShadow: '0 6px 24px rgba(0,0,0,0.18)',
  }

  if (brand.logoDataUrl) {
    return (
      <div style={containerStyle}>
        <img
          src={brand.logoDataUrl}
          alt={`${brand.brandName} logo`}
          style={{ width: '78%', height: '78%', objectFit: 'contain' }}
        />
      </div>
    )
  }

  const initials = brand.brandName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('') || 'B'

  return (
    <div style={containerStyle}>
      <span
        style={{
          color: textColor,
          fontFamily: brand.headingFont,
          fontWeight: 700,
          fontSize: size * 0.38,
          letterSpacing: '0.02em',
        }}
      >
        {initials}
      </span>
    </div>
  )
}
