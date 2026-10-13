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

  // Usuarios 'solo gastos' (o sin tipo_usuario definido) no pueden entrar a RindeNX.
  // En el subdominio rinde.* /dashboard se reescribe a /rinde (loop infinito).
  // Se redirige al dominio principal de GastosNX, que es donde vive su app.
  if (session.tipo_usuario !== 'rinde' && session.tipo_usuario !== 'ambos') {
    redirect('https://gastos.nxchile.com/dashboard')
  }

  return <>{children}</>
}
