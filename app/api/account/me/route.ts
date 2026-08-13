import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { findUserById, readSession, SESSION_COOKIE } from "@/lib/account"

export const runtime = "nodejs"

export async function GET() {
  try {
    const store = await cookies()
    const session = readSession(store.get(SESSION_COOKIE)?.value)
    if (!session) return NextResponse.json({ user: null })
    const user = await findUserById(session.id)
    return NextResponse.json({ user })
  } catch (error) {
    console.error("Account session read failed:", error)
    return NextResponse.json({ user: null })
  }
}
