import React, { useRef, useState } from 'react'
import { BrandProvider, useBrand } from './context/BrandContext.jsx'
import BrandKitPanel from './components/BrandKitPanel.jsx'
import AssetCard from './components/AssetCard.jsx'
import { TEMPLATES } from './data/templates.js'
import { downloadAllAsZip } from './utils/download.js'
import './App.css'

function Studio() {
  const { brand } = useBrand()
  const nodesRef = useRef({})
  const [downloadingAll, setDownloadingAll] = useState(false)

  const registerNode = (id, el) => {
    nodesRef.current[id] = el
  }

  const handleDownloadAll = async () => {
    setDownloadingAll(true)
    try {
      const entries = TEMPLATES.map((template) => ({
        template,
        node: nodesRef.current[template.id],
      })).filter((e) => e.node)
      await downloadAllAsZip(entries, brand.brandName)
    } finally {
      setDownloadingAll(false)
    }
  }

  return (
    <div className="app">
      <header className="app__header">
        <div>
          <h1>Brand Asset Studio</h1>
          <p>Define your brand kit once, get a full set of on-brand social &amp; marketing graphics.</p>
        </div>
        <button className="btn btn--primary" onClick={handleDownloadAll} disabled={downloadingAll}>
          {downloadingAll ? 'Packaging…' : 'Download all (.zip)'}
        </button>
      </header>

      <div className="app__body">
        <BrandKitPanel />
        <main className="asset-grid">
          {TEMPLATES.map((template) => (
            <AssetCard
              key={template.id}
              template={template}
              brand={brand}
              registerNode={registerNode}
            />
          ))}
        </main>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <BrandProvider>
      <Studio />
    </BrandProvider>
  )
}
