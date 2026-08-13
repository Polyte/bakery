import type { Metadata } from "next"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { getAdminSession } from "@/lib/admin/auth"
import { AdminProviders } from "@/components/admin/providers"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { AdminHeader } from "@/components/admin/admin-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

export const metadata: Metadata = {
  title: {
    default: "Admin",
    template: "%s | Dadda's Admin",
  },
  robots: { index: false, follow: false },
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const headerStore = await headers()
  const pathname =
    headerStore.get("x-pathname") ||
    headerStore.get("x-invoke-path") ||
    headerStore.get("next-url") ||
    ""
  const isLogin = pathname === "/admin/login" || pathname.endsWith("/admin/login")

  if (isLogin) {
    return (
      <AdminProviders>
        <div className="min-h-svh bg-cream font-sans text-chocolate-text antialiased">
          {children}
        </div>
      </AdminProviders>
    )
  }

  const session = await getAdminSession()
  if (!session) {
    redirect("/admin/login")
  }

  return (
    <AdminProviders>
      <SidebarProvider>
        <div className="flex min-h-svh w-full bg-cream font-sans text-chocolate-text antialiased">
          <AdminSidebar />
          <SidebarInset className="bg-cream">
            <AdminHeader user={session} />
            <div className="flex-1 p-4 md:p-6 lg:p-8">{children}</div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </AdminProviders>
  )
}
