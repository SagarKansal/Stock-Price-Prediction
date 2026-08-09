import React, { useRef, useState } from 'react'
import { downloadTemplatePng } from '../utils/download.js'

const PREVIEW_MAX_WIDTH = 320

// Renders one template at its true pixel size inside a scaled wrapper (for
// on-screen preview), while keeping the captured node itself untransformed —
// html-to-image bakes a node's own transform into the exported canvas, so the
// scale must live on an ancestor, never on the node passed to the exporter.
export default function AssetCard({ template, brand, registerNode }) {
  const nodeRef = useRef(null)
  const [downloading, setDownloading] = useState(false)
  const { Layout, width, height } = template
  const scale = PREVIEW_MAX_WIDTH / width
  const previewHeight = height * scale

  const setRef = (el) => {
    nodeRef.current = el
    registerNode?.(template.id, el)
  }

  const handleDownload = async () => {
    if (!nodeRef.current) return
    setDownloading(true)
    try {
      await downloadTemplatePng(nodeRef.current, template, brand.brandName)
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div className="asset-card">
      <div
        className="asset-card__preview"
        style={{ width: PREVIEW_MAX_WIDTH, height: previewHeight }}
      >
        <div
          style={{
            width,
            height,
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
          }}
        >
          <div ref={setRef} style={{ width, height }}>
            <Layout brand={brand} width={width} height={height} />
          </div>
        </div>
      </div>
      <div className="asset-card__footer">
        <div>
          <div className="asset-card__name">{template.name}</div>
          <div className="asset-card__dims">
            {template.width} × {template.height} · {template.category}
          </div>
        </div>
        <button className="btn btn--small" onClick={handleDownload} disabled={downloading}>
          {downloading ? 'Rendering…' : 'Download'}
        </button>
      </div>
    </div>
  )
}
