import { NextResponse, type NextRequest } from "next/server"

const ADMIN_COOKIE = "dadda_admin_session"

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set("x-pathname", pathname)

  const hasSession = Boolean(request.cookies.get(ADMIN_COOKIE)?.value)
  const isAdminApi = pathname.startsWith("/api/admin")
  const isAdminPage = pathname.startsWith("/admin")

  if (isAdminApi) {
    if (
      pathname === "/api/admin/auth/login" ||
      pathname === "/api/admin/auth/logout"
    ) {
      return NextResponse.next({ request: { headers: requestHeaders } })
    }
    if (!hasSession) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    return NextResponse.next({ request: { headers: requestHeaders } })
  }

  if (isAdminPage) {
    if (pathname === "/admin/login") {
      if (hasSession) {
        return NextResponse.redirect(new URL("/admin", request.url))
      }
      return NextResponse.next({ request: { headers: requestHeaders } })
    }
    if (!hasSession) {
      const login = new URL("/admin/login", request.url)
      login.searchParams.set("next", pathname)
      return NextResponse.redirect(login)
    }
    return NextResponse.next({ request: { headers: requestHeaders } })
  }

  return NextResponse.next({ request: { headers: requestHeaders } })
}

export const config = {
  matcher: [
    "/admin",
    "/admin/:path*",
    "/api/admin/:path*",
    /*
     * Always attach x-pathname so root layout can hide storefront chrome on /admin.
     * Exclude static assets & next internals.
     */
    "/((?!_next/static|_next/image|favicon.ico|images/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
