import { redirect } from 'next/navigation'
import { readSuperAdminSessionFromCookies } from '@/lib/superadmin-cookies'
import EmpresasClient from './empresas-client'

export default async function EmpresasPage() {
  const session = await readSuperAdminSessionFromCookies()
  if (!session) {
    redirect('/super-admin/login')
  }

  return <EmpresasClient adminEmail={session.email} />
}
