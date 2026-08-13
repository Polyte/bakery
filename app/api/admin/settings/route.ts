import { NextResponse } from "next/server"
import { requireAdminSession } from "@/lib/admin/auth"
import { writeAuditLog } from "@/lib/admin/domain"
import { prisma } from "@/lib/db"

export const runtime = "nodejs"

export async function GET() {
  const { error } = await requireAdminSession()
  if (error) return error

  try {
    const settings = await prisma.siteSetting.findMany({
      orderBy: { key: "asc" },
    })
    const map = Object.fromEntries(settings.map((s) => [s.key, s.value]))
    return NextResponse.json({ settings, map })
  } catch (error) {
    console.error("Admin settings get failed:", error)
    return NextResponse.json({ error: "Could not load settings." }, { status: 500 })
  }
}

type Body = {
  key?: string
  value?: string | unknown
}

export async function PUT(request: Request) {
  const { session, error } = await requireAdminSession()
  if (error) return error

  let body: Body
  try {
    body = (await request.json()) as Body
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 })
  }

  const key = body.key?.trim()
  if (!key) return NextResponse.json({ error: "key is required." }, { status: 400 })

  const value =
    typeof body.value === "string" ? body.value : JSON.stringify(body.value ?? null)

  try {
    const setting = await prisma.siteSetting.upsert({
      where: { key },
      create: { key, value },
      update: { value },
    })

    await writeAuditLog({
      userId: session!.id,
      action: "settings.update",
      entity: "SiteSetting",
      entityId: setting.id,
      newValue: { key, value },
    })

    return NextResponse.json({ setting })
  } catch (error) {
    console.error("Admin settings put failed:", error)
    return NextResponse.json({ error: "Could not save setting." }, { status: 500 })
  }
}
