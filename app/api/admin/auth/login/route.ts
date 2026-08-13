import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import {
  ADMIN_COOKIE,
  adminCookieOptions,
  authenticateAdmin,
  createAdminToken,
} from "@/lib/admin/auth"

export const runtime = "nodejs"

type Body = {
  email?: string
  password?: string
}

export async function POST(request: Request) {
  let body: Body
  try {
    body = (await request.json()) as Body
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 })
  }

  const email = body.email?.trim() ?? ""
  const password = body.password ?? ""
  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required." }, { status: 400 })
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
  } catch (error) {
    console.error("Admin login failed:", error)
    return NextResponse.json({ error: "Could not sign in." }, { status: 500 })
  }
}
