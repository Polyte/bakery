import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import {
  authenticateUser,
  SESSION_COOKIE,
  sessionCookieOptions,
  signSession,
} from "@/lib/account"

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
    const user = await authenticateUser(email, password)
    if (!user) {
      return NextResponse.json({ error: "Those details did not match an account." }, { status: 401 })
    }
    const store = await cookies()
    store.set(SESSION_COOKIE, signSession(user), sessionCookieOptions())
    return NextResponse.json({ user })
  } catch (error) {
    console.error("Account login failed:", error)
    return NextResponse.json({ error: "Could not sign in. Please try again." }, { status: 500 })
  }
}
