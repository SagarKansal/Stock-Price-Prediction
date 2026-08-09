import React from 'react'
import Logo from '../Logo.jsx'
import { mixHex, readableTextColor, withAlpha } from '../../utils/color.js'

// Bold, high-contrast layout for thumbnails — big headline, angled accent
// shape, small logo badge in the corner.
export default function ThumbnailBoldLayout({ brand, width, height }) {
  const bg = `linear-gradient(135deg, ${brand.secondaryColor} 0%, ${brand.primaryColor} 100%)`
  const textColor = readableTextColor(brand.primaryColor)
  const headlineSize = Math.round(height * 0.16)
  const subSize = Math.round(height * 0.06)

  return (
    <div
      style={{
        width,
        height,
        background: bg,
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: width * 0.06,
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 0,
          right: -width * 0.18,
          width: width * 0.55,
          height: height * 1.6,
          background: withAlpha(mixHex(brand.accentColor, '#ffffff', 0.1), 0.9),
          transform: 'rotate(18deg)',
          transformOrigin: 'top right',
        }}
      />

      <div
        style={{
          position: 'absolute',
          top: width * 0.05,
          left: width * 0.06,
          display: 'flex',
          alignItems: 'center',
          gap: width * 0.02,
          zIndex: 1,
        }}
      >
        <Logo brand={brand} size={height * 0.16} shape="circle" />
        <span
          style={{
            fontFamily: brand.headingFont,
            color: textColor,
            fontWeight: 700,
            fontSize: height * 0.05,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
          }}
        >
          {brand.brandName}
        </span>
      </div>

      <div style={{ maxWidth: '62%', zIndex: 1 }}>
        <h1
          style={{
            fontFamily: brand.headingFont,
            color: textColor,
            fontWeight: 800,
            fontSize: headlineSize,
            lineHeight: 1.05,
            margin: 0,
            textShadow: '0 6px 30px rgba(0,0,0,0.25)',
          }}
        >
          {brand.headline}
        </h1>
        <p
          style={{
            fontFamily: brand.bodyFont,
            color: withAlpha(textColor, 0.85),
            fontSize: subSize,
            marginTop: height * 0.035,
          }}
        >
          {brand.subheadline}
        </p>
      </div>
    </div>
  )
}
