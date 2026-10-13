import { sheets_v4 } from 'googleapis'

/**
 * Consumo de boletas de un usuario contado desde los propios registros.
 *
 * Por qué contar filas y no usar una celda contador: `Usuarios!F`
 * (`boletas_usadas`) obliga a un patrón leer-luego-escribir, y dos peticiones
 * simultáneas leen el mismo valor y escriben el mismo `+1`, perdiendo un
 * incremento. Google Sheets no ofrece incremento atómico de una celda, así que
 * cualquier contador suffers la carrera.
 *
 * Los `append` sobre `Gastos!A:L` sí son seguros: cada fila es un hecho
 * consumado y no se sobrescribe. Contando las filas del usuario, el valor
 * autoritativo queda siempre bien y no hay read-modify-write que perder. La
 * celda `Usuarios!F` se conserva solo como dato informativo para leer en la
 * hoja; ninguna decisión de negocio depende de ella.
 *
 * La columna `L` de la hoja `Gastos` es `creado_por` (índice 11).
 */
export async function countExpensesOfUser(
  sheets: sheets_v4.Sheets,
  spreadsheetId: string,
  email: string
): Promise<number> {
  try {
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Gastos!L2:L',
    })
    const rows = res.data.values || []
    const target = email.toLowerCase().trim()
    return rows.reduce((acc, row) => {
      const value = row?.[0]
      return value && value.toLowerCase().trim() === target ? acc + 1 : acc
    }, 0)
  } catch (error) {
    console.error('❌ No se pudo contar los gastos del usuario:', error)
    throw error
  }
}