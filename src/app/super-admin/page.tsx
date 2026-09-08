import { redirect } from 'next/navigation'
import { readSuperAdminSessionFromCookies } from '@/lib/superadmin-cookies'
import SuperAdminDashboardClient from './dashboard-client'

export default async function SuperAdminPage() {
  const session = await readSuperAdminSessionFromCookies()
  if (!session) {
    redirect('/super-admin/login')
  }

  return <SuperAdminDashboardClient email={session.email} />
}
