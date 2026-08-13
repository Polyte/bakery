import { SignJWT, jwtVerify } from "jose"
import type { AdminSession } from "@/lib/admin/types"

export const ADMIN_COOKIE = "dadda_admin_session"
export const ADMIN_MAX_AGE = 60 * 60 * 24 * 7

function getJwtSecret() {
  const secret = process.env.JWT_SECRET?.trim() || process.env.SESSION_SECRET?.trim()
  if (secret) return new TextEncoder().encode(secret)
  if (process.env.NODE_ENV === "production") {
    throw new Error("JWT_SECRET is required in production.")
  }
  return new TextEncoder().encode("dadda-dev-jwt-secret-change-me")
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
      role: String(payload.role ?? ""),
    }
  } catch {
    return null
  }
}
