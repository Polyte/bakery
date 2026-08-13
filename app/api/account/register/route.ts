import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import {
  createUser,
  SESSION_COOKIE,
  sessionCookieOptions,
  signSession,
} from "@/lib/account"

export const runtime = "nodejs"

type Body = {
  email?: string
  password?: string
  firstName?: string
  lastName?: string
  phone?: string
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
  const firstName = body.firstName?.trim() ?? ""
  const lastName = body.lastName?.trim() ?? ""
  const phone = body.phone?.trim() ?? ""

  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "A valid email is required." }, { status: 400 })
  }
  if (!firstName) {
    return NextResponse.json({ error: "Please add your name." }, { status: 400 })
  }
  if (password.length < 8) {
    return NextResponse.json({ error: "Use at least 8 characters for your password." }, { status: 400 })
  }

  try {
    const user = await createUser({ email, password, firstName, lastName, phone })
    const store = await cookies()
    store.set(SESSION_COOKIE, signSession(user), sessionCookieOptions())
    return NextResponse.json({ user })
  } catch (error) {
    if ((error as Error).name === "EMAIL_TAKEN" || (error as Error).message === "EMAIL_TAKEN") {
      return NextResponse.json(
        { error: "An account with this email already exists. Sign in instead." },
        { status: 409 },
      )
    }
    console.error("Account register failed:", error)
    return NextResponse.json({ error: "Could not create the account. Please try again." }, { status: 500 })
  }
}
