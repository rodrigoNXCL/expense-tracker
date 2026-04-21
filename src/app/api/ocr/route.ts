import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 API OCR: Usando Azure AI Vision...')

    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No se proporcionó imagen' }, { status: 400 })
    }

    console.log('📄 Imagen recibida:', file.size, 'bytes')

    // Convertir a ArrayBuffer (bytes crudos)
    const bytes = await file.arrayBuffer()

    // Obtener credenciales
    const endpoint = process.env.AZURE_VISION_ENDPOINT
    const apiKey = process.env.AZURE_VISION_KEY

    if (!endpoint || !apiKey) {
      throw new Error('Faltan credenciales de Azure (revisa .env.local)')
    }

    console.log('🔑 Endpoint:', endpoint)

    // Llamar a Azure AI Vision - Read API
    const analyzeResponse = await fetch(
      `${endpoint}/vision/v3.2/read/analyze?language=es`,
      {
        method: 'POST',
        headers: {
          'Ocp-Apim-Subscription-Key': apiKey,
          'Content-Type': 'application/octet-stream',
        },
        body: bytes,
      }
    )

    if (!analyzeResponse.ok) {
      const errorText = await analyzeResponse.text()
      console.error('❌ Azure API Error:', analyzeResponse.status, errorText)
      throw new Error(`Azure API Error: ${analyzeResponse.status}`)
    }

    // Obtener operation-location para poll results
    const operationLocation = analyzeResponse.headers.get('operation-location')
    if (!operationLocation) {
      throw new Error('No se obtuvo operation-location')
    }

    // Esperar y obtener resultados (polling)
    let result: any = { status: 'running' }
    let attempts = 0
    const maxAttempts = 15

    while (
      (result.status?.toLowerCase() === 'running' || 
       result.status?.toLowerCase() === 'notstarted') && 
      attempts < maxAttempts
    ) {
      await new Promise(resolve => setTimeout(resolve, 1500))
      attempts++

      const resultResponse = await fetch(operationLocation, {
        headers: {
          'Ocp-Apim-Subscription-Key': apiKey,
        },
      })

      result = await resultResponse.json()
      console.log(`🔄 Polling OCR: intento ${attempts}, status: ${result.status}`)
    }

    // Validar status (case-insensitive)
    if (result.status?.toLowerCase() !== 'succeeded') {
      throw new Error(`OCR no completado: ${result.status}`)
    }

    // ===== EXTRAER TEXTO CORRECTAMENTE =====
    let text = ''
    let confidence = 85

    const analyzeResult = result.analyzeResult

    // Opción 1: Usar content (texto completo - más confiable)
    if (analyzeResult?.content && analyzeResult.content.trim().length > 0) {
      text = analyzeResult.content.trim()
    }

    // Opción 2: Extraer desde pages[].lines[].text
    if (!text && analyzeResult?.pages) {
      const allLines: string[] = []
      
      for (const page of analyzeResult.pages) {
        if (page.lines && Array.isArray(page.lines)) {
          for (const line of page.lines) {
            if (line.text) {
              allLines.push(line.text)
              // Calcular confianza desde palabras
              if (line.words && Array.isArray(line.words)) {
                for (const word of line.words) {
                  if (typeof word.confidence === 'number') {
                    confidence = Math.round(word.confidence * 100)
                    break
                  }
                }
              }
            }
          }
        }
      }
      
      text = allLines.join('\n').trim()
    }

    // Opción 3: Fallback a readResults (versión anterior de API)
    if (!text && analyzeResult?.readResults) {
      const allLines: string[] = []
      
      for (const readResult of analyzeResult.readResults) {
        if (readResult.lines && Array.isArray(readResult.lines)) {
          for (const line of readResult.lines) {
            if (line.text) {
              allLines.push(line.text)
            }
          }
        }
      }
      
      text = allLines.join('\n').trim()
    }

    // Debug si texto está vacío
    if (!text) {
      console.warn('⚠️ Azure no extrajo texto. Respuesta:', JSON.stringify({
        status: result.status,
        hasAnalyzeResult: !!analyzeResult,
        hasContent: !!analyzeResult?.content,
        hasPages: !!analyzeResult?.pages,
        pageCount: analyzeResult?.pages?.length,
      }, null, 2))
      throw new Error('No se pudo extraer texto de la imagen')
    }

    console.log(`✅ Azure AI Vision: ${confidence}% confianza`)
    console.log(`📄 Texto extraído:`, text.substring(0, 300))

    return NextResponse.json({ text, confidence })
  } catch (error) {
    console.error('❌ Error API OCR:', error instanceof Error ? error.message : error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error en OCR' },
      { status: 500 }
    )
  }
}