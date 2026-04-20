import Tesseract from 'tesseract.js'

export interface OcrResult {
  text: string
  confidence: number
}

export async function extractTextFromImage(
  imageBlob: Blob,
  onProgress?: (progress: number) => void
): Promise<OcrResult> {
  try {
    // 1. Validar blob
    if (!imageBlob || imageBlob.size === 0) {
      throw new Error('Imagen inválida o vacía')
    }

    // 2. Validar tamaño (máximo 5MB)
    if (imageBlob.size > 5 * 1024 * 1024) {
      throw new Error('Imagen demasiado grande. Máximo 5MB.')
    }

    // 3. Validar tipo
    if (imageBlob.type && !imageBlob.type.startsWith('image/')) {
      throw new Error('El archivo no es una imagen válida')
    }

    // 4. Ejecutar OCR
    const result = await Tesseract.recognize(imageBlob, 'spa', {
      logger: (m) => {
        if (m.status === 'recognizing text') {
          const progress = Math.round(m.progress * 100)
          console.log(` OCR Progreso: ${progress}%`)
          onProgress?.(progress)
        }
      },
    })

    // 5. Validar resultado
    if (!result.data || !result.data.text) {
      throw new Error('No se pudo leer texto de la imagen')
    }

    const text = result.data.text.trim()
    const confidence = result.data.confidence

    console.log(`✅ OCR Completado - Confianza: ${confidence.toFixed(0)}%`)
    console.log(`📄 Texto extraído (${text.length} caracteres)`)

    return {
      text,
      confidence,
    }
  } catch (error) {
    console.error('❌ Error en OCR:', error instanceof Error ? error.message : error)
    throw error
  }
}