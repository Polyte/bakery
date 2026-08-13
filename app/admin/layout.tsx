import type { Metadata } from "next"
import { AdminProviders } from "@/components/admin/providers"

export const metadata: Metadata = {
  title: {
    default: "Admin",
    template: "%s | Dadda's Admin",
  },
  robots: { index: false, follow: false },
}

/** Shared providers only — shell lives in (dashboard)/layout. */
export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminProviders>
      <div className="min-h-svh bg-cream font-sans text-chocolate-text antialiased">{children}</div>
    </AdminProviders>
  )
}
