import React from 'react'

export default function ColorField({ label, value, onChange }) {
  return (
    <label className="color-field">
      <span className="color-field__label">{label}</span>
      <span className="color-field__control">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-label={label}
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="color-field__hex"
          spellCheck={false}
        />
      </span>
    </label>
  )
}
