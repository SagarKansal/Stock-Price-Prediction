// Reads an uploaded image file and resolves its data URL plus true pixel
// dimensions, so a redesign can be generated at the same size as the original.
export function readImageFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = reject
    reader.onload = () => {
      const dataUrl = reader.result
      const img = new Image()
      img.onload = () => {
        resolve({ dataUrl, width: img.naturalWidth, height: img.naturalHeight })
      }
      img.onerror = reject
      img.src = dataUrl
    }
    reader.readAsDataURL(file)
  })
}
