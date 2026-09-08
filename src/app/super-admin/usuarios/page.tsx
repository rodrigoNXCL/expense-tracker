import { redirect } from 'next/navigation'
import { readSuperAdminSessionFromCookies } from '@/lib/superadmin-cookies'
import UsuariosClient from './usuarios-client'

export default async function UsuariosPage() {
  const session = await readSuperAdminSessionFromCookies()
  if (!session) {
    redirect('/super-admin/login')
  }

  return <UsuariosClient adminEmail={session.email} />
}
