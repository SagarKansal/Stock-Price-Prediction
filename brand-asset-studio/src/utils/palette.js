// Client-side dominant-color extraction: downscale the image onto a small
// canvas, bucket pixels into a coarse RGB grid, and return the most frequent
// buckets as hex colors. No server or AI model required.

function toHex(n) {
  return n.toString(16).padStart(2, '0')
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

export async function extractPalette(imageSrc, count = 6) {
  const img = await loadImage(imageSrc)
  const size = 80
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  ctx.drawImage(img, 0, 0, size, size)

  const { data } = ctx.getImageData(0, 0, size, size)
  const bucketSize = 24
  const buckets = new Map()

  for (let i = 0; i < data.length; i += 4) {
    const alpha = data[i + 3]
    if (alpha < 128) continue

    const r = data[i]
    const g = data[i + 1]
    const b = data[i + 2]

    // Skip near-white / near-black pixels so backgrounds/canvases don't
    // dominate the palette over the actual brand colors in the artwork.
    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    if (max > 245 && min > 235) continue
    if (max < 20) continue

    const key = [
      Math.round(r / bucketSize),
      Math.round(g / bucketSize),
      Math.round(b / bucketSize),
    ].join(',')

    const bucket = buckets.get(key)
    if (bucket) {
      bucket.count += 1
      bucket.r += r
      bucket.g += g
      bucket.b += b
    } else {
      buckets.set(key, { count: 1, r, g, b })
    }
  }

  const sorted = [...buckets.values()].sort((a, b) => b.count - a.count)

  const colors = sorted.map(({ count, r, g, b }) => ({
    hex: `#${toHex(Math.round(r / count))}${toHex(Math.round(g / count))}${toHex(
      Math.round(b / count)
    )}`,
    weight: count,
  }))

  // Merge near-duplicate colors so the top results are visually distinct.
  const distinct = []
  for (const color of colors) {
    const isDuplicate = distinct.some((c) => colorDistance(c.hex, color.hex) < 40)
    if (!isDuplicate) distinct.push(color)
    if (distinct.length >= count) break
  }

  return distinct
}

function colorDistance(hexA, hexB) {
  const a = parseInt(hexA.slice(1), 16)
  const b = parseInt(hexB.slice(1), 16)
  const ar = (a >> 16) & 255
  const ag = (a >> 8) & 255
  const ab = a & 255
  const br = (b >> 16) & 255
  const bg = (b >> 8) & 255
  const bb = b & 255
  return Math.sqrt((ar - br) ** 2 + (ag - bg) ** 2 + (ab - bb) ** 2)
}
