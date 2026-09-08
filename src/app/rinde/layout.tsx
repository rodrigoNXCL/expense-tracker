import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { verifySessionToken } from '@/lib/session'

export const dynamic = 'force-dynamic'

export default async function RindeLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = await cookies()
  const sessionToken = cookieStore.get('gx_session')?.value
  const session = sessionToken ? verifySessionToken(sessionToken) : null

  if (!session) {
    redirect('/login')
  }

  // Usuarios 'solo gastos' (o sin tipo_usuario definido) no pueden entrar a RindeNX
  if (session.tipo_usuario !== 'rinde' && session.tipo_usuario !== 'ambos') {
    redirect('/dashboard')
  }

  return <>{children}</>
}
