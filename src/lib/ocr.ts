import { google } from 'googleapis'

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

// Convertir Blob a base64
function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

// Calcular confianza desde bloques de texto
function calculateConfidenceFromBlocks(blocks: any[] | undefined): number {
  if (!blocks || blocks.length === 0) return 0

  let totalConfidence = 0
  let blockCount = 0

  for (const block of blocks) {
    if (block.blockType === 'TEXT' && block.paragraphs) {
      for (const paragraph of block.paragraphs) {
        if (paragraph.words) {
          for (const word of paragraph.words) {
            if (word.symbols) {
              for (const symbol of word.symbols) {
                if (symbol.confidence) {
                  totalConfidence += symbol.confidence
                  blockCount++
                }
              }
            }
          }
        }
      }
    }
  }

  return blockCount > 0 ? (totalConfidence / blockCount) * 100 : 85
}