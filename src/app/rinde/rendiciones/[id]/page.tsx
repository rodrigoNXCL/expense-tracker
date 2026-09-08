import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { verifySessionToken } from '@/lib/session'
import RendicionDetalleClient from './detalle-client'

export const dynamic = 'force-dynamic'

export default async function RendicionDetallePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const cookieStore = await cookies()
  const token = cookieStore.get('gx_session')?.value
  const session = token ? verifySessionToken(token) : null

  if (!session) {
    redirect('/login')
  }

  const { id } = await params
  const sessionWithTipo = { ...session, tipo_usuario: 'rinde' as const }
  return <RendicionDetalleClient session={sessionWithTipo} rendicionId={id} />
}
