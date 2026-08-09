import React from 'react'

// Renders children at a fixed true pixel size (width x height), visually
// scaled down to fit within maxWidth. `innerRef`, if given, is attached to
// the untransformed inner node so callers can export it at full resolution
// with html-to-image (the scale must never be on the captured node itself).
export default function ScaledFrame({ width, height, maxWidth = 360, innerRef, children }) {
  const scale = Math.min(1, maxWidth / width)
  const displayWidth = width * scale
  const displayHeight = height * scale

  return (
    <div
      style={{
        width: displayWidth,
        height: displayHeight,
        overflow: 'hidden',
        position: 'relative',
        background: '#f0f1f4',
      }}
    >
      <div style={{ width, height, transform: `scale(${scale})`, transformOrigin: 'top left' }}>
        <div ref={innerRef} style={{ width, height }}>
          {children}
        </div>
      </div>
    </div>
  )
}
