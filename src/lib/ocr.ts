import Tesseract from 'tesseract.js'

export interface OcrResult {
  fullText: string
  confidence: number
  lines: string[]
}

export async function extractTextFromImage(
  imageBlob: Blob,
  onProgress?: (progress: number) => void
): Promise<OcrResult> {
  try {
    const result = await Tesseract.recognize(imageBlob, 'spa', {
      logger: (message) => {
        if (message.status === 'recognizing text') {
          onProgress?.(Math.round(message.progress * 100))
        }
      },
    })

    const { text, confidence } = result.data
    const lines = text.split('\n').filter(line => line.trim().length > 0)

    return {
      fullText: text.trim(),
      confidence,
      lines,
    }
  } catch (error) {
    console.error('Error en OCR:', error)
    throw new Error('No se pudo extraer el texto de la imagen')
  }
}