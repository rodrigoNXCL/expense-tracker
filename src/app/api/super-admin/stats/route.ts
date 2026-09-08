import { NextRequest, NextResponse } from 'next/server'
import { getSheets } from '@/lib/sheets'
import { readSuperAdminSession } from '@/lib/superadmin-cookies'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const session = await readSuperAdminSession(request)
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const configSheetId = process.env.GOOGLE_CONFIG_SHEET_ID
    const usersSheetId = process.env.GOOGLE_SHEET_ID_USERS

    if (!configSheetId || !usersSheetId) {
      return NextResponse.json({ error: 'Faltan variables de entorno' }, { status: 500 })
    }

    const sheets = await getSheets()

    const empresasRes = await sheets.spreadsheets.values.get({
      spreadsheetId: configSheetId,
      range: 'Config!A2:E',
    })
    const empresasRows = empresasRes.data.values || []
    const empresas = empresasRows.filter((row: any[]) => row[0] && row[1] && row[2])
    const empresasActivas = empresas.filter((row: any[]) =>
      String(row[4] || '').toUpperCase() === 'TRUE'
    ).length

    const usuariosRes = await sheets.spreadsheets.values.get({
      spreadsheetId: usersSheetId,
      range: 'Usuarios!A2:K',
    })
    const usuariosRows = usuariosRes.data.values || []
    const usuariosActivos = usuariosRows.filter((row: any[]) =>
      String(row[6] || '').toUpperCase() === 'TRUE'
    ).length
    const usuariosPorTipo = {
      gastos: usuariosRows.filter((row: any[]) => (row[10] || 'gastos') === 'gastos').length,
      rinde: usuariosRows.filter((row: any[]) => row[10] === 'rinde').length,
      ambos: usuariosRows.filter((row: any[]) => row[10] === 'ambos').length,
    }
    const usuariosPorPlan = {
      free: usuariosRows.filter((row: any[]) => (row[3] || 'free') === 'free').length,
      pro: usuariosRows.filter((row: any[]) => row[3] === 'pro').length,
      enterprise: usuariosRows.filter((row: any[]) => row[3] === 'enterprise').length,
    }

    return NextResponse.json({
      empresas: {
        total: empresas.length,
        activas: empresasActivas,
        inactivas: empresas.length - empresasActivas,
      },
      usuarios: {
        total: usuariosRows.length,
        activos: usuariosActivos,
        inactivos: usuariosRows.length - usuariosActivos,
        por_tipo: usuariosPorTipo,
        por_plan: usuariosPorPlan,
      },
    })
  } catch (error) {
    console.error('❌ Error en GET /api/super-admin/stats:', error)
    return NextResponse.json(
      { error: 'Error cargando estadísticas', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    )
  }
}
