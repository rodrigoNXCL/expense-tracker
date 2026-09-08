export interface ParsedExpense {
  fecha: string
  rut: string
  proveedor: string
  monto: number
  giro: string
  boletaNumero: string
  tipoDocumento: 'boleta' | 'factura' | 'voucher' | 'sin_comprobante'
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

  // ===== 0. TIPO DE DOCUMENTO =====
  // Detectar si es voucher de tarjeta o factura
  const esVoucher = /TARJETA\s*(DE\s*)?DEBITO|VALIDO COMO BOLETA|MONTO\s*(DE\s*)?COMPRA|OPERACION|AUTORIZACION/i.test(fullText)
  const esFactura = /FACTURA\b/i.test(fullText) && !esVoucher
  let tipoDocumento: ParsedExpense['tipoDocumento'] = esFactura ? 'factura' : esVoucher ? 'voucher' : 'boleta'

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
  // El RUT del PROVEEDOR. En vouchers puede aparecer deformado por OCR (ej. "99.900,900-9" o "99.900.900-9").
  // El RUT del proveedor siempre está en el bloque superior (nombre/dirección), NUNCA en el bloque de la tarjeta.
  // Estrategia: buscar SOLO en la sección superior del documento (antes de la zona de transacción/tarjeta).
  let rut = ''
  // Delimita la zona de tarjeta/transacción para excluir tokens de tarjeta.
  // Usa un número largo (tarjeta) o la zona de operación; NO "TARJETA" (que puede encabezar el voucher).
  const mTarjeta = fullText.match(/\d{12,}/)
  const idxOperacion = fullText.search(/MONTO\s*COMPRA|NUMERO\s*DE\s*OPERACION|CODIGO\s*DE\s*AUTORIZACION|TERMINAL|AUTORIZACION/)
  let corte = mTarjeta ? mTarjeta.index! : idxOperacion
  if (corte === -1 || (idxOperacion !== -1 && idxOperacion < corte)) corte = idxOperacion
  const bloqueSuperior = corte === -1 ? fullText : fullText.slice(0, corte)
  const candidatosRut: { valor: string; etiquetado: boolean }[] = []
  const rutPatterns = [
    // Precedido por la etiqueta RUT
    /RUT[:\s\n]*(\d{1,2}[.,]?\d{3}[.,]?\d{3}[-\s]?[\dKk])/,
    // Formato deformado con comas/miles y guión antes del dígito
    /(\d{1,2}[.,]\d{3}[.,]\d{3}[-\s]?[\dKk])/,
    // Estándar chileno
    /(\d{1,2}\.?\d{3}\.?\d{3}[-\s]?[\dKk])/,
  ]
  for (const pattern of rutPatterns) {
    const etiquetado = pattern.source.includes('RUT')
    const re = new RegExp(pattern.source, 'g')
    let match
    while ((match = re.exec(bloqueSuperior)) !== null) {
      const norm = normalizeRut(match[1])
      // Forma de RUT: 6-8 dígitos + guión opcional + DV
      if (/^\d{6,8}-?[0-9K]$/.test(norm)) {
        candidatosRut.push({ valor: norm, etiquetado })
      }
      if (match[0].length === 0) re.lastIndex++
    }
  }
  // Priorizar etiquetado "RUT", luego DV válido, luego posición
  const ordenPorLinea = (v: string): number => {
    const idx = bloqueSuperior.indexOf(v.slice(0, 4))
    return idx === -1 ? 9999 : idx
  }
  candidatosRut.sort((a, b) => {
    if (a.etiquetado !== b.etiquetado) return a.etiquetado ? -1 : 1
    const validA = validarDigitoVerificador(a.valor) ? 0 : 1
    const validB = validarDigitoVerificador(b.valor) ? 0 : 1
    if (validA !== validB) return validA - validB
    return ordenPorLinea(a.valor) - ordenPorLinea(b.valor)
  })
  rut = candidatosRut[0]?.valor || ''

  // ===== 3. PROVEEDOR =====
  let proveedor = 'Proveedor no detectado'
  // Prioridad: líneas que suenan a razón social (con "SA.", "SPA.", "LTDA.", "EIRL", "LIMITADA", "SOCIEDAD")
  const razonSocial = lines.slice(0, 8).find(l =>
    l.length > 3 && /\b(SA\.?|SPA\.?|LTDA\.?|EIRL|E\.I\.R\.L\.|LIMITADA|SOCIEDAD)\b/i.test(l) &&
    !/RUT|FECHA|TOTAL|BOLETA|TARJETA|VISA|MONTO|OPERACION|AUTORIZACION|HORA|TERMINAL/i.test(l)
  )
  if (razonSocial) {
    proveedor = razonSocial
  } else {
    // Fallback: primera línea "tipo nombre" (ignorar keywords)
    for (const line of lines.slice(0, 10)) {
      const upper = line.toUpperCase()
      if (line.length > 3 && line.length < 50 &&
          !upper.includes('RUT') && !upper.includes('FECHA') &&
          !upper.includes('TOTAL') && !upper.includes('BOLETA') &&
          !upper.includes('TARJETA') && !upper.includes('VISA') &&
          !upper.includes('MONTO') && !upper.includes('HORA') &&
          !upper.includes('TERMINAL') && !upper.includes('VALIDO') &&
          !/^\d+$/.test(line.replace(/[.\-\s,]/g, ''))) {
        proveedor = line
        break
      }
    }
  }

  // ===== 4. MONTO =====
  // Captura el número en la MISMA línea o en la línea SIGUIENTE a TOTAL/MONTO COMPRA
  let monto = 0
  const capturarMonto = (valor: string): number => {
    const m = parseMontoChileno(valor)
    return isNaN(m) ? 0 : m
  }
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    if (/^(TOTAL|MONTO\s*COMPRA|MONTO)[\s:]*$/i.test(line)) {
      // La siguiente línea numérica es el monto
      for (let j = i + 1; j < Math.min(i + 4, lines.length); j++) {
        const valor = capturarMonto(lines[j].replace(/[$,]/g, m => (m === ',' ? '.' : m)).trim())
        if (valor > 100 && valor < 100000000) { monto = valor; break }
      }
      if (monto > 0) break
    }
    const inline = fullText.match(/^(TOTAL|MONTO)[\s:]*([\d.,]+)$/)
    if (inline && monto === 0) {
      const v = capturarMonto(inline[2])
      if (v > 100 && v < 100000000) monto = v
    }
  }
  // Fallback: número más grande razonable (excluye tokens de tarjeta)
  if (monto === 0) {
    const numbers = fullText.replace(/COMPRA|AUTORIZACION|OPERACION|TARJETA/g, ' ').match(/\d{1,3}(?:[.,]\d{3})*(?:,\d{2})?/g)
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

  console.log('✅ Parseado:', { proveedor, rut, monto, fecha, boletaNumero, tipoDocumento })

  return { fecha, rut, proveedor, monto, giro, boletaNumero, tipoDocumento, rawText: ocrText, confidence }
}

// ===== HELPERS =====
function normalizeFecha(f: string): string {
  const p = f.split(/[-/]/)
  return p.length === 3 ? (p[0].length === 4 ? f : `${p[2]}-${p[1]}-${p[0]}`) : new Date().toISOString().split('T')[0]
}
function normalizeRut(r: string): string {
  // Deja el RUT en formato estándar: cuerpo (6-8 dígitos) + "-" + DV
  return r.replace(/\./g, '').replace(/,/g, '').replace(/\s/g, '').toUpperCase()
}
function parseMontoChileno(m: string): number {
  // Si usa "," como separador de miles y termina en "-digito" no es monto; si termina en ,dd es con decimales
  let s = m.replace(/\$|\s/g, '')
  // Formato "99.900,900" (deformado): quitar el separador de miles "." y la parte tras la coma queda como decimal
  if (/^\d+\.\d{3},\d{3,}/.test(s)) s = s.replace(/\./g, '')
  const n = parseFloat(s.replace(/\./g, '').replace(',', '.'))
  return isNaN(n) ? 0 : n
}
function validarDigitoVerificador(rut: string): boolean {
  const clean = rut.replace(/\-/g, '')
  // Rechaza RUTs claramente imposibles: formato no válido
  if (!/^\d{6,8}[0-9K]$/.test(clean)) return false
  const cuerpo = clean.slice(0, -1)
  const dv = clean.slice(-1)
  let suma = 0
  let multiplo = 2
  for (let i = cuerpo.length - 1; i >= 0; i--) {
    suma += parseInt(cuerpo[i]) * multiplo
    multiplo = multiplo === 7 ? 2 : multiplo + 1
  }
  const resto = 11 - (suma % 11)
  const dvEsperado = resto === 11 ? '0' : resto === 10 ? 'K' : String(resto)
  return dv === dvEsperado
}