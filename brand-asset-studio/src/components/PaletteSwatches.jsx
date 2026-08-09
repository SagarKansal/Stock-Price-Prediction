import React from 'react'
import { readableTextColor } from '../utils/color.js'

// Shows extracted colors as swatches; each can be assigned directly to one
// of the brand kit's color roles.
export default function PaletteSwatches({ colors, onAssign }) {
  if (!colors?.length) return null

  return (
    <div className="palette">
      {colors.map((c) => (
        <div key={c.hex} className="palette__swatch" style={{ background: c.hex }}>
          <span className="palette__hex" style={{ color: readableTextColor(c.hex) }}>
            {c.hex}
          </span>
          <div className="palette__actions">
            <button title="Use as primary" onClick={() => onAssign(c.hex, 'primaryColor')}>
              P
            </button>
            <button title="Use as secondary" onClick={() => onAssign(c.hex, 'secondaryColor')}>
              S
            </button>
            <button title="Use as accent" onClick={() => onAssign(c.hex, 'accentColor')}>
              A
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
