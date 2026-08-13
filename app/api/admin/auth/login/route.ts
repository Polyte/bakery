import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import {
  ADMIN_COOKIE,
  adminCookieOptions,
  authenticateAdmin,
  createAdminToken,
} from "@/lib/admin/auth"
import { clientIp, enforceRateLimit, isValidEmail, readJsonBody } from "@/lib/security"

export const runtime = "nodejs"

const MAX_BODY = 8 * 1024
const MAX_PASSWORD = 128

type Body = {
  email?: string
  password?: string
}

export async function POST(request: Request) {
  const limited = await enforceRateLimit(`rl:admin:login:${clientIp(request)}`, 8, 15 * 60)
  if (limited) return limited

  const body = await readJsonBody<Body>(request, MAX_BODY)
  if (body instanceof NextResponse) return body

  const email = body.email?.trim() ?? ""
  const password = body.password ?? ""
  if (!isValidEmail(email) || !password || password.length > MAX_PASSWORD) {
    return NextResponse.json({ error: "Invalid credentials." }, { status: 401 })
  }

  try {
    const user = await authenticateAdmin(email, password)
    if (!user) {
      return NextResponse.json({ error: "Invalid credentials." }, { status: 401 })
    }
    const token = await createAdminToken(user)
    const jar = await cookies()
    jar.set(ADMIN_COOKIE, token, adminCookieOptions())
    return NextResponse.json({ user })
  } catch {
    console.error("Admin login failed")
    return NextResponse.json({ error: "Could not sign in." }, { status: 500 })
  }
}
