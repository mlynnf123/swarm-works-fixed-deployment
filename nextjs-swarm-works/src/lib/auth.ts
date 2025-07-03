import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { redirect } from 'next/navigation'

export async function getCurrentUser() {
  const session = await getServerSession(authOptions)
  return session?.user
}

export async function requireAuth() {
  const user = await getCurrentUser()
  if (!user) {
    redirect('/login')
  }
  return user
}

export async function requireRole(allowedRoles: string[]) {
  const user = await requireAuth()
  if (!allowedRoles.includes(user.role)) {
    redirect('/unauthorized')
  }
  return user
}

export async function requireClient() {
  return await requireRole(['CLIENT', 'ADMIN'])
}

export async function requireDeveloper() {
  return await requireRole(['DEVELOPER', 'ADMIN'])
}

export async function requireAdmin() {
  return await requireRole(['ADMIN'])
}