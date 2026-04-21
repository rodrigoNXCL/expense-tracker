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
  // Normalizar texto: unificar saltos de línea y espacios
  const normalized = ocrText
    .replace(/\r\n/g, '\n')
    .replace(/\n{2,}/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .trim()
  
  const lines = normalized.split('\n').map(l => l.trim()).filter(l => l.length > 0)
  const fullText = normalized.toUpperCase()

  // ===== 1. FECHA =====
  let fecha = new Date().toISOString().split('T')[0]
  const fechaPatterns = [
    /(?:FECHA|EMISION|EMISIÓN)[:\s\n]*(\d{2}[-/]\d{2}[-/]\d{4})/i,
    /(\d{2}[-/]\d{2}[-/]\d{4})/,
  ]
  for (const pattern of fechaPatterns) {
    const match = fullText.match(pattern)
    if (match) {
      fecha = normalizeFecha(match[1])
      break
    }
  }

  // ===== 2. RUT =====
  let rut = ''
  const rutPatterns = [
    /RUT[:\s\n]*(\d{1,2}\.?\d{3}\.?\d{3}[-\s]?[\dKk])/,
    /(\d{1,2}\.?\d{3}\.?\d{3}[-\s]?[\dKk])/,
  ]
  for (const pattern of rutPatterns) {
    const match = fullText.match(pattern)
    if (match) {
      rut = normalizeRut(match[1])
      break
    }
  }

  // ===== 3. PROVEEDOR =====
  let proveedor = 'Proveedor no detectado'
  // Buscar primeras líneas que parezcan nombre (ignorar keywords)
  for (const line of lines.slice(0, 10)) {
    const upper = line.toUpperCase()
    if (line.length > 5 && line.length < 50 &&
        !upper.includes('RUT') && !upper.includes('FECHA') &&
        !upper.includes('TOTAL') && !upper.includes('BOLETA') &&
        !upper.includes('SII') && !/^\d+$/.test(line.replace(/[.\-\s]/g, ''))) {
      proveedor = line
      break
    }
  }

  // ===== 4. MONTO =====
  let monto = 0
  const montoPatterns = [
    /TOTAL[:\s\n]*\$?\s*([\d\.]+,\d{2})/,
    /([\d\.]+,\d{2})\s*$/, // Número al final de línea
  ]
  for (const pattern of montoPatterns) {
    const match = fullText.match(pattern)
    if (match) {
      monto = parseMontoChileno(match[1])
      if (monto > 0) break
    }
  }
  // Fallback: número más grande razonable
  if (monto === 0) {
    const numbers = fullText.match(/\d{1,3}(?:\.\d{3})*(?:,\d{2})?/g)
    if (numbers) {
      const amounts = numbers.map(n => parseMontoChileno(n)).filter(n => n > 100 && n < 10000000)
      if (amounts.length > 0) monto = Math.max(...amounts)
    }
  }

  // ===== 5. GIRO y BOLETA =====
  const giroMatch = fullText.match(/GIRO[:\s\n]*([A-Z\s\.]+)/i)
  const giro = giroMatch ? giroMatch[1].trim() : ''

  const boletaMatch = fullText.match(/(?:BOLETA|N°|NO)\s*[:\.\s]*(\d{6,10})/i)
  const boletaNumero = boletaMatch ? boletaMatch[1] : ''

  console.log('✅ Parseado:', { proveedor, rut, monto, fecha, boletaNumero })

  return { fecha, rut, proveedor, monto, giro, boletaNumero, rawText: ocrText, confidence }
}

// ===== HELPERS =====
function normalizeFecha(f: string): string {
  const p = f.split(/[-/]/)
  return p.length === 3 ? (p[0].length === 4 ? f : `${p[2]}-${p[1]}-${p[0]}`) : new Date().toISOString().split('T')[0]
}
function normalizeRut(r: string): string { return r.replace(/\./g, '').replace(/\s/g, '').toUpperCase() }
function parseMontoChileno(m: string): number {
  const n = parseFloat(m.replace(/\./g, '').replace(',', '.'))
  return isNaN(n) ? 0 : n
}