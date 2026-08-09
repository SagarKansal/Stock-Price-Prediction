import React, { useRef } from 'react'
import { useBrand } from '../context/BrandContext.jsx'
import { FONT_OPTIONS } from '../data/fonts.js'
import ColorField from './ColorField.jsx'

export default function BrandKitPanel() {
  const { brand, updateBrand, resetBrand } = useBrand()
  const fileInputRef = useRef(null)

  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => updateBrand({ logoDataUrl: reader.result })
    reader.readAsDataURL(file)
  }

  return (
    <aside className="panel">
      <div className="panel__header">
        <h2>Brand kit</h2>
        <button className="btn btn--ghost btn--small" onClick={resetBrand}>
          Reset
        </button>
      </div>

      <div className="field">
        <label>Brand name</label>
        <input
          type="text"
          value={brand.brandName}
          onChange={(e) => updateBrand({ brandName: e.target.value })}
        />
      </div>

      <div className="field">
        <label>Tagline</label>
        <input
          type="text"
          value={brand.tagline}
          onChange={(e) => updateBrand({ tagline: e.target.value })}
        />
      </div>

      <div className="field">
        <label>Logo</label>
        <div className="logo-upload">
          {brand.logoDataUrl && (
            <img src={brand.logoDataUrl} alt="Logo preview" className="logo-upload__preview" />
          )}
          <button className="btn btn--small" onClick={() => fileInputRef.current?.click()}>
            {brand.logoDataUrl ? 'Replace logo' : 'Upload logo'}
          </button>
          {brand.logoDataUrl && (
            <button
              className="btn btn--small btn--ghost"
              onClick={() => updateBrand({ logoDataUrl: null })}
            >
              Remove
            </button>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/svg+xml,image/webp"
            hidden
            onChange={handleLogoUpload}
          />
        </div>
        <p className="hint">No logo? A monogram badge is generated automatically.</p>
      </div>

      <div className="field-group">
        <ColorField
          label="Primary"
          value={brand.primaryColor}
          onChange={(v) => updateBrand({ primaryColor: v })}
        />
        <ColorField
          label="Secondary"
          value={brand.secondaryColor}
          onChange={(v) => updateBrand({ secondaryColor: v })}
        />
        <ColorField
          label="Accent"
          value={brand.accentColor}
          onChange={(v) => updateBrand({ accentColor: v })}
        />
      </div>

      <div className="field">
        <label>Heading font</label>
        <select
          value={brand.headingFont}
          onChange={(e) => updateBrand({ headingFont: e.target.value })}
        >
          {FONT_OPTIONS.map((f) => (
            <option key={f.name} value={f.name}>
              {f.name}
            </option>
          ))}
        </select>
      </div>

      <div className="field">
        <label>Body font</label>
        <select value={brand.bodyFont} onChange={(e) => updateBrand({ bodyFont: e.target.value })}>
          {FONT_OPTIONS.map((f) => (
            <option key={f.name} value={f.name}>
              {f.name}
            </option>
          ))}
        </select>
      </div>

      <div className="panel__divider" />

      <h2>Content</h2>
      <div className="field">
        <label>Headline</label>
        <textarea
          rows={2}
          value={brand.headline}
          onChange={(e) => updateBrand({ headline: e.target.value })}
        />
      </div>
      <div className="field">
        <label>Subheadline</label>
        <textarea
          rows={2}
          value={brand.subheadline}
          onChange={(e) => updateBrand({ subheadline: e.target.value })}
        />
      </div>
      <div className="field">
        <label>Call to action (optional)</label>
        <input
          type="text"
          value={brand.cta}
          onChange={(e) => updateBrand({ cta: e.target.value })}
        />
      </div>
    </aside>
  )
}
