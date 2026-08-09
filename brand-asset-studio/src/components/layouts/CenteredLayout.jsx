import React from 'react'
import Logo from '../Logo.jsx'
import { mixHex, readableTextColor, withAlpha } from '../../utils/color.js'

// Centered hero layout — logo, headline, subheadline, optional CTA pill.
// Used for square/vertical formats (social posts, stories).
export default function CenteredLayout({ brand, width, height }) {
  const bg = `linear-gradient(155deg, ${brand.primaryColor} 0%, ${mixHex(
    brand.primaryColor,
    brand.secondaryColor,
    0.65
  )} 100%)`
  const textColor = readableTextColor(brand.primaryColor)
  const logoSize = Math.round(width * 0.16)
  const headlineSize = Math.round(width * 0.072)
  const subSize = Math.round(width * 0.03)
  const ctaSize = Math.round(width * 0.026)

  return (
    <div
      style={{
        width,
        height,
        background: bg,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: width * 0.08,
        boxSizing: 'border-box',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          width: width * 0.9,
          height: width * 0.9,
          borderRadius: '50%',
          background: withAlpha(brand.accentColor, 0.18),
          top: -width * 0.35,
          right: -width * 0.3,
        }}
      />
      <div
        style={{
          position: 'absolute',
          width: width * 0.6,
          height: width * 0.6,
          borderRadius: '50%',
          border: `2px solid ${withAlpha('#ffffff', 0.15)}`,
          bottom: -width * 0.25,
          left: -width * 0.2,
        }}
      />

      <Logo brand={brand} size={logoSize} shape="circle" />

      <h1
        style={{
          fontFamily: brand.headingFont,
          color: textColor,
          fontSize: headlineSize,
          fontWeight: 800,
          lineHeight: 1.1,
          margin: `${width * 0.045}px 0 ${width * 0.02}px`,
          maxWidth: '90%',
        }}
      >
        {brand.headline}
      </h1>

      <p
        style={{
          fontFamily: brand.bodyFont,
          color: withAlpha(textColor, 0.85),
          fontSize: subSize,
          lineHeight: 1.4,
          maxWidth: '78%',
          margin: 0,
        }}
      >
        {brand.subheadline}
      </p>

      {brand.cta && (
        <div
          style={{
            marginTop: width * 0.055,
            padding: `${width * 0.02}px ${width * 0.045}px`,
            borderRadius: 999,
            background: brand.accentColor,
            color: readableTextColor(brand.accentColor),
            fontFamily: brand.bodyFont,
            fontWeight: 700,
            fontSize: ctaSize,
          }}
        >
          {brand.cta}
        </div>
      )}

      <div
        style={{
          position: 'absolute',
          bottom: width * 0.05,
          fontFamily: brand.headingFont,
          color: withAlpha(textColor, 0.75),
          fontSize: width * 0.022,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
        }}
      >
        {brand.brandName}
      </div>
    </div>
  )
}
