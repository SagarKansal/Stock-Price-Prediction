import React, { useRef, useState } from 'react'
import { BrandProvider, useBrand } from './context/BrandContext.jsx'
import BrandKitPanel from './components/BrandKitPanel.jsx'
import AssetCard from './components/AssetCard.jsx'
import RedesignStudio from './components/RedesignStudio.jsx'
import BrandGallery from './components/BrandGallery.jsx'
import { TEMPLATES } from './data/templates.js'
import { downloadAllAsZip } from './utils/download.js'
import './App.css'

const TABS = [
  { id: 'templates', label: 'Templates' },
  { id: 'redesign', label: 'Redesign Studio' },
  { id: 'gallery', label: 'Brand Gallery' },
]

function Studio() {
  const { brand } = useBrand()
  const [activeTab, setActiveTab] = useState('templates')
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
        {activeTab === 'templates' && (
          <button className="btn btn--primary" onClick={handleDownloadAll} disabled={downloadingAll}>
            {downloadingAll ? 'Packaging…' : 'Download all (.zip)'}
          </button>
        )}
      </header>

      <nav className="tabs">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            className={`tabs__item ${activeTab === tab.id ? 'tabs__item--active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <div className="app__body">
        <BrandKitPanel />
        <main className="app__main">
          {activeTab === 'templates' && (
            <div className="asset-grid">
              {TEMPLATES.map((template) => (
                <AssetCard
                  key={template.id}
                  template={template}
                  brand={brand}
                  registerNode={registerNode}
                />
              ))}
            </div>
          )}
          {activeTab === 'redesign' && <RedesignStudio />}
          {activeTab === 'gallery' && <BrandGallery />}
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
