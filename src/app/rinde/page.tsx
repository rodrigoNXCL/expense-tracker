import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { verifySessionToken } from '@/lib/session'
import RindeDashboardClient from './dashboard-client'

export const dynamic = 'force-dynamic'

export default async function RindeDashboardPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('gx_session')?.value
  const session = token ? verifySessionToken(token) : null

  if (!session) {
    redirect('/login')
  }

  const sessionWithTipo = {
    ...session,
    tipo_usuario: session.tipo_usuario || ('rinde' as const),
  }
  if ((sessionWithTipo as any).tipo_usuario === 'gastos') {
    redirect('/dashboard')
  }

  return <RindeDashboardClient session={sessionWithTipo} />
}
