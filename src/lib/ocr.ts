export interface OcrResult {
  text: string
  /**
   * Google Cloud Vision en TEXT_DETECTION no entrega un puntaje de confianza
   * real, así que la API devuelve `null` en lugar de un valor inventado
   * (ADR-005). La revisión de los datos extraídos es responsabilidad del
   * usuario, no de un número que no existe.
   */
  confidence: number | null
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

    // `confidence` llega como null: no se inventa un porcentaje (ADR-005).
    // Formatearlo sin guardia rompía el flujo con
    // "Cannot read properties of null (reading 'toFixed')".
    const confianza = result.confidence ?? null
    console.log(
      confianza === null
        ? '✅ OCR: texto extraído (sin puntaje de confianza disponible)'
        : `✅ OCR: ${Number(confianza).toFixed(0)}% confianza`
    )
    console.log(`📄 Texto:`, result.text.substring(0, 300))

    return {
      text: result.text,
      confidence: confianza,
    }
  } catch (error) {
    console.error('❌ Error OCR:', error instanceof Error ? error.message : error)
    throw error
  }
}