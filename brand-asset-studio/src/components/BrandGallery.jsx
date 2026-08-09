import React, { useState } from 'react'
import { useBrand } from '../context/BrandContext.jsx'
import { readImageFile } from '../utils/image.js'
import { extractPalette } from '../utils/palette.js'
import PaletteSwatches from './PaletteSwatches.jsx'

let nextId = 1

// A reference board for documenting brand guidelines through examples:
// upload old-vs-new creative pairs with a note on what changed and why, and
// pull a color palette straight out of a "new" example to seed the brand kit.
export default function BrandGallery() {
  const { updateBrand } = useBrand()
  const [entries, setEntries] = useState([])
  const [oldDraft, setOldDraft] = useState(null)
  const [newDraft, setNewDraft] = useState(null)
  const [note, setNote] = useState('')
  const [paletteByEntry, setPaletteByEntry] = useState({})
  const [extracting, setExtracting] = useState(null)

  const handleUpload = (setDraft) => async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const { dataUrl } = await readImageFile(file)
    setDraft(dataUrl)
  }

  const addEntry = () => {
    if (!newDraft) return
    const id = nextId++
    setEntries((prev) => [{ id, oldUrl: oldDraft, newUrl: newDraft, note }, ...prev])
    setOldDraft(null)
    setNewDraft(null)
    setNote('')
  }

  const removeEntry = (id) => {
    setEntries((prev) => prev.filter((entry) => entry.id !== id))
    setPaletteByEntry((prev) => {
      const next = { ...prev }
      delete next[id]
      return next
    })
  }

  const handleExtract = async (entry) => {
    setExtracting(entry.id)
    try {
      const colors = await extractPalette(entry.newUrl, 6)
      setPaletteByEntry((prev) => ({ ...prev, [entry.id]: colors }))
    } finally {
      setExtracting(null)
    }
  }

  const assignColor = (hex, role) => updateBrand({ [role]: hex })

  return (
    <div className="gallery">
      <div className="gallery__intro">
        <h2>Brand reference gallery</h2>
        <p>
          Add before/after examples of your creative work with a short note on what
          changed and why. Then pull a color palette straight from a "new" example
          and apply it to your brand kit in one click.
        </p>
      </div>

      <div className="gallery__form">
        <div className="gallery__uploads">
          <label className="upload-slot">
            <span>Old creative (optional)</span>
            {oldDraft ? (
              <img src={oldDraft} alt="Old draft" />
            ) : (
              <span className="upload-slot__placeholder">+</span>
            )}
            <input type="file" accept="image/*" hidden onChange={handleUpload(setOldDraft)} />
          </label>
          <label className="upload-slot">
            <span>New creative</span>
            {newDraft ? (
              <img src={newDraft} alt="New draft" />
            ) : (
              <span className="upload-slot__placeholder">+</span>
            )}
            <input type="file" accept="image/*" hidden onChange={handleUpload(setNewDraft)} />
          </label>
        </div>
        <textarea
          placeholder="What changed, and why? e.g. Switched to brand navy, replaced the stock photo with a product shot, simplified the headline."
          rows={2}
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
        <button className="btn btn--primary" onClick={addEntry} disabled={!newDraft}>
          Add to gallery
        </button>
      </div>

      <div className="gallery__grid">
        {entries.length === 0 && (
          <p className="hint">No reference examples yet — add your first old/new pair above.</p>
        )}
        {entries.map((entry) => (
          <div key={entry.id} className="gallery__card">
            <div className="gallery__pair">
              {entry.oldUrl && (
                <div className="gallery__image">
                  <span className="gallery__label">Old</span>
                  <img src={entry.oldUrl} alt="Old creative" />
                </div>
              )}
              <div className="gallery__image">
                <span className="gallery__label">New</span>
                <img src={entry.newUrl} alt="New creative" />
              </div>
            </div>
            {entry.note && <p className="gallery__note">{entry.note}</p>}
            <div className="gallery__actions">
              <button
                className="btn btn--small"
                onClick={() => handleExtract(entry)}
                disabled={extracting === entry.id}
              >
                {extracting === entry.id ? 'Extracting…' : 'Extract palette'}
              </button>
              <button className="btn btn--small btn--ghost" onClick={() => removeEntry(entry.id)}>
                Remove
              </button>
            </div>
            {paletteByEntry[entry.id] && (
              <PaletteSwatches colors={paletteByEntry[entry.id]} onAssign={assignColor} />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
