import { compare, hash } from "bcryptjs"
import { SignJWT, jwtVerify } from "jose"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { UserRole } from "@prisma/client"
import { prisma } from "@/lib/db"
import { isStaffRole } from "@/lib/admin/domain"
import type { AdminSession } from "@/lib/admin/types"

export const ADMIN_COOKIE = "dadda_admin_session"
export const ADMIN_MAX_AGE = 60 * 60 * 24 * 7 // 7 days

function getJwtSecret() {
  const secret = process.env.JWT_SECRET?.trim() || process.env.SESSION_SECRET?.trim()
  if (secret) return new TextEncoder().encode(secret)
  if (process.env.NODE_ENV === "production") {
    throw new Error("JWT_SECRET is required in production.")
  }
  return new TextEncoder().encode("dadda-dev-jwt-secret-change-me")
}

export async function hashPassword(password: string) {
  return hash(password, 10)
}

export async function verifyPassword(password: string, passwordHash: string) {
  return compare(password, passwordHash)
}

export async function createAdminToken(session: AdminSession) {
  return new SignJWT({
    email: session.email,
    firstName: session.firstName,
    lastName: session.lastName,
    role: session.role,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(session.id)
    .setIssuedAt()
    .setExpirationTime(`${ADMIN_MAX_AGE}s`)
    .sign(getJwtSecret())
}

export async function verifyAdminToken(token: string): Promise<AdminSession | null> {
  try {
    const { payload } = await jwtVerify(token, getJwtSecret())
    if (!payload.sub || typeof payload.email !== "string") return null
    return {
      id: payload.sub,
      email: payload.email,
      firstName: String(payload.firstName ?? ""),
      lastName: String(payload.lastName ?? ""),
      role: payload.role as UserRole,
    }
  } catch {
    return null
  }
}

export function adminCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    path: "/",
    maxAge: ADMIN_MAX_AGE,
    secure: process.env.NODE_ENV === "production",
  }
}

export async function getAdminSession(): Promise<AdminSession | null> {
  const jar = await cookies()
  const token = jar.get(ADMIN_COOKIE)?.value
  if (!token) return null
  const session = await verifyAdminToken(token)
  if (!session || !isStaffRole(session.role)) return null
  return session
}

export async function requireAdminSession(roles?: UserRole[]) {
  const session = await getAdminSession()
  if (!session) {
    return { session: null as AdminSession | null, error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) }
  }
  if (roles && !roles.includes(session.role) && session.role !== UserRole.SUPER_ADMIN) {
    return { session: null as AdminSession | null, error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) }
  }
  return { session, error: null }
}

export async function authenticateAdmin(email: string, password: string) {
  const user = await prisma.user.findUnique({
    where: { email: email.trim().toLowerCase() },
  })
  if (!user || !user.isActive || !isStaffRole(user.role)) return null
  const ok = await verifyPassword(password, user.passwordHash)
  if (!ok) return null
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
