import React from 'react'
import Logo from '../Logo.jsx'
import { readableTextColor, withAlpha } from '../../utils/color.js'

// Wide split layout — a solid brand-color panel with the logo/name on one
// side, headline + subheadline on the other. Used for headers/banners/OG images.
export default function BannerSplitLayout({ brand, width, height }) {
  const panelWidth = width * 0.32
  const panelTextColor = readableTextColor(brand.primaryColor)
  const bodyTextColor = readableTextColor('#ffffff')
  const logoSize = Math.min(height * 0.32, panelWidth * 0.42)
  const headlineSize = Math.round(height * 0.15)
  const subSize = Math.round(height * 0.065)

  return (
    <div
      style={{
        width,
        height,
        display: 'flex',
        background: '#ffffff',
        fontFamily: brand.bodyFont,
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          width: panelWidth,
          minWidth: panelWidth,
          background: brand.primaryColor,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: height * 0.08,
          position: 'relative',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: `linear-gradient(200deg, transparent 40%, ${withAlpha(
              brand.secondaryColor,
              0.35
            )} 100%)`,
          }}
        />
        <Logo brand={brand} size={logoSize} shape="rounded" />
        <div
          style={{
            fontFamily: brand.headingFont,
            color: panelTextColor,
            fontWeight: 700,
            fontSize: height * 0.09,
            textAlign: 'center',
            padding: `0 ${panelWidth * 0.1}px`,
            zIndex: 1,
          }}
        >
          {brand.brandName}
        </div>
      </div>

      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: `0 ${width * 0.05}px`,
          background: `linear-gradient(120deg, ${withAlpha(brand.secondaryColor, 0.08)}, #ffffff 55%)`,
        }}
      >
        <h1
          style={{
            fontFamily: brand.headingFont,
            color: '#101318',
            fontWeight: 800,
            fontSize: headlineSize,
            lineHeight: 1.15,
            margin: 0,
          }}
        >
          {brand.headline}
        </h1>
        <p
          style={{
            fontFamily: brand.bodyFont,
            color: withAlpha('#101318', 0.68),
            fontSize: subSize,
            marginTop: height * 0.05,
            maxWidth: '85%',
          }}
        >
          {brand.subheadline}
        </p>
        {brand.cta && (
          <div
            style={{
              marginTop: height * 0.08,
              alignSelf: 'flex-start',
              padding: `${height * 0.035}px ${height * 0.07}px`,
              borderRadius: 999,
              background: brand.accentColor,
              color: readableTextColor(brand.accentColor),
              fontWeight: 700,
              fontSize: subSize * 0.85,
            }}
          >
            {brand.cta}
          </div>
        )}
      </div>
    </div>
  )
}
