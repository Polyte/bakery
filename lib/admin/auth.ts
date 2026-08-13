import { compare, hash } from "bcryptjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { UserRole } from "@prisma/client"
import {
  ADMIN_COOKIE,
  ADMIN_MAX_AGE,
  adminCookieOptions,
  createAdminToken,
  verifyAdminToken,
} from "@/lib/admin/jwt"
import { prisma } from "@/lib/db"
import { isStaffRole } from "@/lib/admin/domain"
import type { AdminSession } from "@/lib/admin/types"

export { ADMIN_COOKIE, ADMIN_MAX_AGE, adminCookieOptions, createAdminToken, verifyAdminToken }

const DUMMY_BCRYPT = "$2b$10$jwflBRgQ9GUVsc4HdYnBp.t78GQ32sr3517LK61FzhuyrRfZA7P9y"

export async function hashPassword(password: string) {
  return hash(password, 10)
}

export async function verifyPassword(password: string, passwordHash: string) {
  return compare(password, passwordHash)
}

export async function getAdminSession(): Promise<AdminSession | null> {
  const jar = await cookies()
  const token = jar.get(ADMIN_COOKIE)?.value
  if (!token) return null
  const session = await verifyAdminToken(token)
  if (!session || !isStaffRole(session.role as UserRole)) return null
  return session
}

export async function requireAdminSession(roles?: UserRole[]) {
  const session = await getAdminSession()
  if (!session) {
    return { session: null as AdminSession | null, error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) }
  }
  if (roles && !roles.includes(session.role as UserRole) && session.role !== UserRole.SUPER_ADMIN) {
    return { session: null as AdminSession | null, error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) }
  }
  return { session, error: null }
}

export async function authenticateAdmin(email: string, password: string) {
  const user = await prisma.user.findUnique({
    where: { email: email.trim().toLowerCase() },
  })
  const hashToCheck = user?.passwordHash || DUMMY_BCRYPT
  const ok = await verifyPassword(password, hashToCheck)
  if (!user || !user.isActive || !isStaffRole(user.role) || !ok) return null
  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  })
  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
  } satisfies AdminSession
}
