export interface ParsedExpense {
  fecha: string
  rut: string
  proveedor: string
  monto: number
  giro: string
  boletaNumero: string
  rawText: string
  confidence: number
  categoria?: string
  notas?: string
}

export function parseBoletaChilena(ocrText: string, confidence: number): ParsedExpense {
  const lines = ocrText.split('\n').map(l => l.trim()).filter(l => l.length > 0)
  const fullText = ocrText
  
  // Fecha: DD-MM-YYYY o YYYY-MM-DD
  const fechaPattern = /(?:Fecha|Fcha|Emision)[:\s]*(\d{2}[-/]\d{2}[-/]\d{4}|\d{4}[-/]\d{2}[-/]\d{2})/i
  const fechaMatch = fullText.match(fechaPattern)
  const fecha = fechaMatch ? normalizeFecha(fechaMatch[1]) : new Date().toISOString().split('T')[0]

  // RUT: X.XXX.XXX-X o XXXXXXXX-X
  const rutPattern = /RUT[:\s]*(\d{1,2}\.?\d{3}\.?\d{3}[-\s]?\d{Kk0-9}|\d{7,8}[-\s]?\d{Kk0-9})/i
  const rutMatch = fullText.match(rutPattern)
  const rut = rutMatch ? normalizeRut(rutMatch[1]) : ''

  // Proveedor/Razón Social
  const proveedorPattern = /(?:R\.?\s*Social|Razon)[:\s]*([A-Z\s\.&Y]+(?:LTDA|LDA|SA|SPA|S\.A\.|Y CIA)?)/i
  const proveedorMatch = fullText.match(proveedorPattern)
  const proveedor = proveedorMatch ? proveedorMatch[1].trim() : extractProveedorFromHeader(lines)

  // Monto total (SUBTOTAL o TOTAL)
  const montoPattern = /(?:SUBTOTAL|TOTAL|Total)[\s:]*\$?\s*([\d\.]+,\d{2}|\d{1,3}(?:\.\d{3})*(?:,\d{2})?)/i
  const montoMatch = fullText.match(montoPattern)
  const monto = montoMatch ? parseMontoChileno(montoMatch[1]) : 0

  // Giro
  const giroPattern = /Giro[:\s]*([A-Z\s\.]+(?:DE SERVICIO|COMERCIO|VENTAS)?)/i
  const giroMatch = fullText.match(giroPattern)
  const giro = giroMatch ? giroMatch[1].trim() : ''

  // Número de boleta
  const boletaPattern = /Boleta(?:\s*Electronica)?[:\s]*(\d{6,10})/i
  const boletaMatch = fullText.match(boletaPattern)
  const boletaNumero = boletaMatch ? boletaMatch[1] : ''

  const result = {
    fecha,
    rut,
    proveedor,
    monto,
    giro,
    boletaNumero,
    rawText: fullText,
    confidence,
  }

  // Warning si el monto es 0 o confianza es baja
  if (monto === 0 && confidence < 70) {
    console.warn('⚠️ OCR de baja calidad: monto=0, confianza=' + confidence + '%')
    console.warn('Recomendación: Usar zoom 2x y mejor iluminación')
  }

  return result
}

// ===== HELPERS =====

function normalizeFecha(fechaStr: string): string {
  const parts = fechaStr.split(/[-/]/)
  if (parts.length === 3) {
    if (parts[0].length === 4) {
      return fechaStr
    }
    return `${parts[2]}-${parts[1]}-${parts[0]}`
  }
  return new Date().toISOString().split('T')[0]
}

function normalizeRut(rutStr: string): string {
  return rutStr.replace(/\./g, '').replace(/\s/g, '').toUpperCase()
}

function parseMontoChileno(montoStr: string): number {
  const cleaned = montoStr.replace(/\./g, '').replace(',', '.')
  const num = parseFloat(cleaned)
  return isNaN(num) ? 0 : num
}

function extractProveedorFromHeader(lines: string[]): string {
  const header = lines[0]
  if (header && header.length < 30 && /^[A-Z\s\.]+$/.test(header)) {
    return header
  }
  return 'Proveedor no detectado'
}