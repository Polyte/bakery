import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import {
  createUser,
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
  firstName?: string
  lastName?: string
  phone?: string
}

export async function POST(request: Request) {
  const limited = await enforceRateLimit(`rl:account:register:${clientIp(request)}`, 5, 15 * 60)
  if (limited) return limited

  const body = await readJsonBody<Body>(request, MAX_BODY)
  if (body instanceof NextResponse) return body

  const email = body.email?.trim() ?? ""
  const password = body.password ?? ""
  const firstName = body.firstName?.trim() ?? ""
  const lastName = body.lastName?.trim() ?? ""
  const phone = body.phone?.trim() ?? ""

  if (!isValidEmail(email)) {
    return NextResponse.json({ error: "A valid email is required." }, { status: 400 })
  }
  if (!firstName || firstName.length > 80) {
    return NextResponse.json({ error: "Please add your name." }, { status: 400 })
  }
  if (lastName.length > 80 || phone.length > 40) {
    return NextResponse.json({ error: "Please check your details." }, { status: 400 })
  }
  if (password.length < 8 || password.length > MAX_PASSWORD) {
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
    console.error("Account register failed")
    return NextResponse.json({ error: "Could not create the account. Please try again." }, { status: 500 })
  }
}
