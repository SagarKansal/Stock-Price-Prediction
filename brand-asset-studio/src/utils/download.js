import { toPng } from 'html-to-image'
import { saveAs } from 'file-saver'
import JSZip from 'jszip'

function slugify(str) {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

// Renders a DOM node at its true (unscaled) pixel size regardless of any
// CSS `transform: scale()` applied for on-screen preview purposes.
export async function nodeToPngBlob(node, width, height) {
  const dataUrl = await toPng(node, {
    width,
    height,
    pixelRatio: 1,
    cacheBust: true,
  })
  const res = await fetch(dataUrl)
  return res.blob()
}

export async function downloadTemplatePng(node, template, brandName) {
  const blob = await nodeToPngBlob(node, template.width, template.height)
  saveAs(blob, `${slugify(brandName)}-${template.id}.png`)
}

export async function downloadAllAsZip(entries, brandName) {
  const zip = new JSZip()
  for (const { node, template } of entries) {
    const blob = await nodeToPngBlob(node, template.width, template.height)
    zip.file(`${template.id}.png`, blob)
  }
  const content = await zip.generateAsync({ type: 'blob' })
  saveAs(content, `${slugify(brandName)}-brand-assets.zip`)
}
