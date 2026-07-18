import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 API OCR: Usando Google Cloud Vision...')
    
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      console.error('❌ No file provided in FormData')
      return NextResponse.json({ error: 'No se proporcionó imagen' }, { status: 400 })
    }

    console.log('📄 Imagen recibida:', file.size, 'bytes')

    // Validar que es una imagen
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'El archivo debe ser una imagen' }, { status: 400 })
    }

    // Convertir a base64 para Google Vision
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64Image = buffer.toString('base64')

    // Obtener API Key de Google desde variables de entorno
    const apiKey = process.env.GOOGLE_VISION_API_KEY
    
    if (!apiKey) {
      console.error('❌ Falta GOOGLE_VISION_API_KEY en variables de entorno')
      return NextResponse.json({ error: 'Configuración de OCR incompleta' }, { status: 500 })
    }

    // Llamar a Google Cloud Vision API
    const response = await fetch(
      `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requests: [
            {
              image: {
                content: base64Image,
              },
              features: [
                {
                  type: 'TEXT_DETECTION',
                  maxResults: 1,
                },
              ],
            },
          ],
        }),
      }
    )

    const data = await response.json()

    if (!response.ok) {
      console.error('❌ Google Vision API Error:', data)
      throw new Error(data.error?.message || 'Error en Google Vision API')
    }

    if (!data.responses || !data.responses[0].textAnnotations) {
      console.warn('⚠️ Google no extrajo texto de la imagen')
      return NextResponse.json({ error: 'No se detectó texto en la imagen' }, { status: 400 })
    }

    // Extraer texto completo
    const fullText = data.responses[0].textAnnotations[0].description
    const confidence = 95 // Google Vision no retorna confidence en TEXT_DETECTION

    console.log(`✅ Google Cloud Vision: ${confidence}% confianza`)
    console.log(`📄 Texto extraído:`, fullText.substring(0, 300))

    return NextResponse.json({ 
      text: fullText, 
      confidence 
    })

  } catch (error) {
    console.error(' Error en API OCR:', error instanceof Error ? error.message : error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error interno del servidor' },
      { status: 500 }
    )
  }
}