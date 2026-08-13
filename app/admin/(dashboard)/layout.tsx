import { redirect } from "next/navigation"
import { getAdminSession } from "@/lib/admin/auth"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { AdminHeader } from "@/components/admin/admin-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getAdminSession()
  if (!session) {
    redirect("/admin/login")
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-svh w-full bg-cream">
        <AdminSidebar />
        <SidebarInset className="bg-cream">
          <AdminHeader user={session} />
          <div className="flex-1 p-4 md:p-6 lg:p-8">
            <Suspense
              fallback={
                <div className="space-y-4">
                  <Skeleton className="h-10 w-64" />
                  <Skeleton className="h-64 w-full rounded-xl" />
                </div>
              }
            >
              {children}
            </Suspense>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
