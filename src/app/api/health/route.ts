import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('❌ Health check: Faltan variables de entorno de Supabase')
      return NextResponse.json(
        { status: 'error', message: 'Supabase configuration missing' },
        { status: 500 }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey)

    // ✅ OPCIÓN 1: Verificar conexión listando buckets de storage
    // Esto no requiere tablas, solo verifica que Supabase responda
    const { data: buckets, error: bucketsError } = await supabase
      .storage
      .listBuckets()

    if (bucketsError) {
      console.error('❌ Health check error (storage):', bucketsError)
      return NextResponse.json(
        { status: 'error', message: bucketsError.message },
        { status: 500 }
      )
    }

    // ✅ Respuesta exitosa
    return NextResponse.json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      message: 'Supabase is alive',
      buckets: buckets?.length || 0
    })

  } catch (error) {
    console.error('❌ Health check exception:', error)
    return NextResponse.json(
      { status: 'error', message: 'Internal server error' },
      { status: 500 }
    )
  }
}

// ✅ Edge runtime para respuesta más rápida
export const runtime = 'edge'