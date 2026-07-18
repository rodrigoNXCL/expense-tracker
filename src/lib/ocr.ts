export interface OcrResult {
  text: string
  confidence: number
}

export async function extractTextFromImage(
  imageBlob: Blob,
  onProgress?: (progress: number) => void
): Promise<OcrResult> {
  try {
    console.log('🚀 Enviando imagen a API OCR...')
    onProgress?.(20)

    // 1. Crear FormData
    const formData = new FormData()
    formData.append('file', imageBlob, 'receipt.jpg')
    onProgress?.(40)

    // 2. Llamar a la API Route
    const response = await fetch('/api/ocr', {
      method: 'POST',
      body: formData,
    })

    onProgress?.(80)

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Error en OCR')
    }

    const result = await response.json()
    onProgress?.(100)

    console.log(`✅ OCR: ${result.confidence.toFixed(0)}% confianza`)
    console.log(`📄 Texto:`, result.text.substring(0, 300))

    return {
      text: result.text,
      confidence: result.confidence,
    }
  } catch (error) {
    console.error('❌ Error OCR:', error instanceof Error ? error.message : error)
    throw error
  }
}