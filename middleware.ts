import { NextResponse, type NextRequest } from "next/server"
import { ADMIN_COOKIE, verifyAdminToken } from "@/lib/admin/jwt"
import { applySecurityHeaders, isAllowedOrigin } from "@/lib/security-headers"

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"])
const CSRF_EXEMPT = new Set(["/api/checkout/yoco/webhook"])

function withHeaders(response: NextResponse) {
  return applySecurityHeaders(response)
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set("x-pathname", pathname)

  const next = () => withHeaders(NextResponse.next({ request: { headers: requestHeaders } }))

  if (
    !SAFE_METHODS.has(request.method) &&
    pathname.startsWith("/api/") &&
    !CSRF_EXEMPT.has(pathname)
  ) {
    if (!isAllowedOrigin(request)) {
      return withHeaders(
        NextResponse.json({ error: "Forbidden." }, { status: 403 }),
      )
    }
  }

  const token = request.cookies.get(ADMIN_COOKIE)?.value
  const adminSession = token ? await verifyAdminToken(token) : null
  const isAdminApi = pathname.startsWith("/api/admin")
  const isAdminPage = pathname.startsWith("/admin")

  if (isAdminApi) {
    if (
      pathname === "/api/admin/auth/login" ||
      pathname === "/api/admin/auth/logout"
    ) {
      return next()
    }
    if (!adminSession) {
      return withHeaders(NextResponse.json({ error: "Unauthorized" }, { status: 401 }))
    }
    return next()
  }

  if (isAdminPage) {
    if (pathname === "/admin/login") {
      if (adminSession) {
        return withHeaders(NextResponse.redirect(new URL("/admin", request.url)))
      }
      return next()
    }
    if (!adminSession) {
      const login = new URL("/admin/login", request.url)
      login.searchParams.set("next", pathname)
      return withHeaders(NextResponse.redirect(login))
    }
    return next()
  }

  return next()
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
    "/((?!_next/static|_next/image|favicon.ico|images/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|mp4|ico)$).*)",
  ],
}
