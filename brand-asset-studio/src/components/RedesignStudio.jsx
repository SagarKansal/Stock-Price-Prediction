import React, { useRef, useState } from 'react'
import { useBrand } from '../context/BrandContext.jsx'
import { REDESIGN_STYLES, getStyle } from '../data/redesignStyles.js'
import { suggestStyleId } from '../utils/layoutPicker.js'
import { readImageFile } from '../utils/image.js'
import { downloadCustomPng, slugify } from '../utils/download.js'
import ScaledFrame from './ScaledFrame.jsx'

// Lets a user upload an existing/old creative, then generates a new
// on-brand version at the exact same dimensions using the current brand
// kit — a deterministic, no-AI-required way to "redesign" a piece of
// collateral so it matches the brand guidelines.
export default function RedesignStudio() {
  const { brand } = useBrand()
  const [oldAsset, setOldAsset] = useState(null)
  const [styleId, setStyleId] = useState(REDESIGN_STYLES[0].id)
  const [downloading, setDownloading] = useState(false)
  const fileInputRef = useRef(null)
  const afterNodeRef = useRef(null)

  const handleUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const { dataUrl, width, height } = await readImageFile(file)
    setOldAsset({ dataUrl, width, height, name: file.name.replace(/\.[^.]+$/, '') })
    setStyleId(suggestStyleId(width, height))
  }

  const handleDownload = async () => {
    if (!afterNodeRef.current || !oldAsset) return
    setDownloading(true)
    try {
      const filename = `${slugify(brand.brandName)}-redesign-${slugify(oldAsset.name)}.png`
      await downloadCustomPng(afterNodeRef.current, oldAsset.width, oldAsset.height, filename)
    } finally {
      setDownloading(false)
    }
  }

  const { Layout } = getStyle(styleId)

  return (
    <div className="redesign">
      <div className="redesign__intro">
        <h2>Redesign an existing creative</h2>
        <p>
          Upload an old piece of collateral and generate a new version at the same
          dimensions, styled with your current brand kit.
        </p>
        <button className="btn" onClick={() => fileInputRef.current?.click()}>
          {oldAsset ? 'Upload a different creative' : 'Upload old creative'}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          hidden
          onChange={handleUpload}
        />
      </div>

      {oldAsset && (
        <>
          <div className="redesign__style-picker">
            <span>Style:</span>
            {REDESIGN_STYLES.map((style) => (
              <button
                key={style.id}
                className={`chip ${styleId === style.id ? 'chip--active' : ''}`}
                onClick={() => setStyleId(style.id)}
              >
                {style.name}
              </button>
            ))}
          </div>

          <div className="redesign__compare">
            <div className="redesign__pane">
              <h3>Before</h3>
              <ScaledFrame width={oldAsset.width} height={oldAsset.height} maxWidth={420}>
                <img
                  src={oldAsset.dataUrl}
                  alt="Original creative"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </ScaledFrame>
              <p className="hint">
                {oldAsset.width} × {oldAsset.height}
              </p>
            </div>

            <div className="redesign__pane">
              <h3>After</h3>
              <ScaledFrame
                width={oldAsset.width}
                height={oldAsset.height}
                maxWidth={420}
                innerRef={afterNodeRef}
              >
                <Layout brand={brand} width={oldAsset.width} height={oldAsset.height} />
              </ScaledFrame>
              <button className="btn btn--primary" onClick={handleDownload} disabled={downloading}>
                {downloading ? 'Rendering…' : 'Download redesign'}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
