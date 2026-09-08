import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { verifySessionToken } from '@/lib/session'
import FondosClient from './fondos-client'

export const dynamic = 'force-dynamic'

export default async function FondosPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('gx_session')?.value
  const session = token ? verifySessionToken(token) : null

  if (!session) {
    redirect('/login')
  }

  if ((session as any).tipo_usuario === 'gastos') {
    redirect('/dashboard')
  }

  return <FondosClient session={session} />
}
