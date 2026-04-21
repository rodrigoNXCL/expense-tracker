import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseKey)

/**
 * Subir imagen de boleta a Supabase Storage
 * @param imageBlob - La imagen capturada
 * @param userEmail - Email del usuario (para organizar carpetas)
 * @param timestamp - Timestamp único para el nombre del archivo
 * @returns URL pública de la imagen o null si falla
 */
export async function uploadReceiptImage(
  imageBlob: Blob,
  userEmail: string,
  timestamp: string
): Promise<string | null> {
  try {
    // Sanitizar email para usarlo en la ruta
    const safeEmail = userEmail.replace(/[^a-zA-Z0-9]/g, '_')
    const fileName = `${safeEmail}/${timestamp}.jpg`

    // Subir al bucket "receipts"
    const { data, error } = await supabase.storage
      .from('receipts')
      .upload(fileName, imageBlob, {
        cacheControl: '3600',
        upsert: false,
        contentType: 'image/jpeg',
      })

    if (error) {
      console.error('❌ Error subiendo imagen:', error.message)
      return null
    }

    // Obtener URL pública
    const { data: urlData } = supabase.storage
      .from('receipts')
      .getPublicUrl(fileName)

    console.log(`✅ Imagen subida: ${urlData.publicUrl}`)
    return urlData.publicUrl
  } catch (error) {
    console.error('❌ Error en uploadReceiptImage:', error)
    return null
  }
}

/**
 * Eliminar imagen de boleta
 * @param imageUrl - URL completa de la imagen
 */
export async function deleteReceiptImage(imageUrl: string): Promise<void> {
  try {
    // Extraer el path de la URL
    const urlParts = imageUrl.split('/receipts/')
    if (urlParts.length < 2) return

    const path = urlParts[1]

    await supabase.storage.from('receipts').remove([path])
    console.log(`✅ Imagen eliminada: ${path}`)
  } catch (error) {
    console.error('❌ Error eliminando imagen:', error)
  }
}