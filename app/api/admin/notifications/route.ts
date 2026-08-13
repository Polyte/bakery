import { NextResponse } from "next/server"
import { requireAdminSession } from "@/lib/admin/auth"
import { prisma } from "@/lib/db"

export const runtime = "nodejs"

export async function GET(request: Request) {
  const { session, error } = await requireAdminSession()
  if (error) return error

  try {
    const unreadOnly = new URL(request.url).searchParams.get("unread") === "true"
    const where = {
      OR: [{ userId: session!.id }, { userId: null }],
      ...(unreadOnly ? { isRead: false } : {}),
    }

    const [items, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: 100,
      }),
      prisma.notification.count({
        where: {
          OR: [{ userId: session!.id }, { userId: null }],
          isRead: false,
        },
      }),
    ])

    return NextResponse.json({ items, unreadCount })
  } catch (error) {
    console.error("Admin notifications get failed:", error)
    return NextResponse.json({ error: "Could not load notifications." }, { status: 500 })
  }
}

type Body = {
  id?: string
  ids?: string[]
  all?: boolean
}

export async function PATCH(request: Request) {
  const { session, error } = await requireAdminSession()
  if (error) return error

  let body: Body
  try {
    body = (await request.json()) as Body
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 })
  }

  try {
    if (body.all) {
      await prisma.notification.updateMany({
        where: {
          OR: [{ userId: session!.id }, { userId: null }],
          isRead: false,
        },
        data: { isRead: true },
      })
      return NextResponse.json({ ok: true })
    }

    const ids = body.ids ?? (body.id ? [body.id] : [])
    if (!ids.length) {
      return NextResponse.json({ error: "id or ids is required." }, { status: 400 })
    }

    await prisma.notification.updateMany({
      where: {
        id: { in: ids },
        OR: [{ userId: session!.id }, { userId: null }],
      },
      data: { isRead: true },
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("Admin notifications patch failed:", error)
    return NextResponse.json({ error: "Could not update notifications." }, { status: 500 })
  }
}
