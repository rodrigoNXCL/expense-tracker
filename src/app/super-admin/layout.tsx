import { redirect } from 'next/navigation'
import { readSuperAdminSessionFromCookies } from '@/lib/superadmin-cookies'

export default async function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
