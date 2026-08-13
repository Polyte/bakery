import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import {
  authenticateUser,
  SESSION_COOKIE,
  sessionCookieOptions,
  signSession,
} from "@/lib/account"
import {
  clientIp,
  enforceRateLimit,
  isValidEmail,
  readJsonBody,
} from "@/lib/security"

export const runtime = "nodejs"

const MAX_BODY = 8 * 1024
const MAX_PASSWORD = 128

type Body = {
  email?: string
  password?: string
}

export async function POST(request: Request) {
  const limited = await enforceRateLimit(`rl:account:login:${clientIp(request)}`, 8, 15 * 60)
  if (limited) return limited

  const body = await readJsonBody<Body>(request, MAX_BODY)
  if (body instanceof NextResponse) return body

  const email = body.email?.trim() ?? ""
  const password = body.password ?? ""
  if (!isValidEmail(email) || !password || password.length > MAX_PASSWORD) {
    return NextResponse.json({ error: "Those details did not match an account." }, { status: 401 })
  }

  try {
    const user = await authenticateUser(email, password)
    if (!user) {
      return NextResponse.json({ error: "Those details did not match an account." }, { status: 401 })
    }
    const store = await cookies()
    store.set(SESSION_COOKIE, signSession(user), sessionCookieOptions())
    return NextResponse.json({ user })
  } catch {
    console.error("Account login failed")
    return NextResponse.json({ error: "Could not sign in. Please try again." }, { status: 500 })
  }
}
