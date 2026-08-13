import { NextResponse } from "next/server"
import { requireAdminSession } from "@/lib/admin/auth"

export const runtime = "nodejs"

export async function GET() {
  const { session, error } = await requireAdminSession()
  if (error) return error
  return NextResponse.json({ user: session })
}
