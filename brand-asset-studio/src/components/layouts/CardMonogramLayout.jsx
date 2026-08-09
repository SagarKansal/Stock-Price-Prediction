import React from 'react'
import Logo from '../Logo.jsx'
import { readableTextColor, withAlpha } from '../../utils/color.js'

// Business-card-style layout: logo + name top-left, tagline bottom, accent bar.
export default function CardMonogramLayout({ brand, width, height }) {
  const textColor = readableTextColor('#ffffff')
  const nameSize = Math.round(height * 0.11)
  const tagSize = Math.round(height * 0.055)

  return (
    <div
      style={{
        width,
        height,
        background: '#ffffff',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: width * 0.07,
        boxSizing: 'border-box',
        border: `1px solid ${withAlpha('#000000', 0.08)}`,
      }}
    >
      <div
        style={{
          position: 'absolute',
          right: 0,
          bottom: 0,
          width: width * 0.45,
          height: height * 0.9,
          background: `linear-gradient(160deg, ${brand.primaryColor}, ${brand.secondaryColor})`,
          borderTopLeftRadius: height * 1.2,
        }}
      />

      <div style={{ display: 'flex', alignItems: 'center', gap: width * 0.03, zIndex: 1 }}>
        <Logo brand={brand} size={height * 0.24} shape="rounded" />
        <div>
          <div
            style={{
              fontFamily: brand.headingFont,
              fontWeight: 800,
              fontSize: nameSize,
              color: '#101318',
            }}
          >
            {brand.brandName}
          </div>
          <div
            style={{
              fontFamily: brand.bodyFont,
              fontSize: tagSize,
              color: withAlpha('#101318', 0.6),
              marginTop: height * 0.015,
            }}
          >
            {brand.tagline}
          </div>
        </div>
      </div>

      <div
        style={{
          zIndex: 1,
          alignSelf: 'flex-end',
          textAlign: 'right',
          color: textColor,
          fontFamily: brand.bodyFont,
          fontSize: tagSize * 0.9,
          maxWidth: '50%',
        }}
      >
        <div style={{ fontWeight: 700, fontSize: tagSize * 1.05 }}>{brand.headline}</div>
      </div>
    </div>
  )
}
