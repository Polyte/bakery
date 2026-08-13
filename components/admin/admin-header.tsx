"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import { Bell, LogOut, Moon, Search, Sun, User } from "lucide-react"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import type { AdminSession } from "@/lib/admin/domain"

type AdminHeaderProps = {
  user?: AdminSession | null
}

export function AdminHeader({ user }: AdminHeaderProps) {
  const router = useRouter()
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)
  const [loggingOut, setLoggingOut] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  async function handleLogout() {
    setLoggingOut(true)
    try {
      await fetch("/api/admin/auth/logout", { method: "POST" })
      router.push("/admin/login")
      router.refresh()
    } finally {
      setLoggingOut(false)
    }
  }

  const initials = [user?.firstName?.[0], user?.lastName?.[0]]
    .filter(Boolean)
    .join("")
    .toUpperCase() || user?.email?.[0]?.toUpperCase() || "A"

  return (
    <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-border/80 bg-cream-surface/90 px-3 backdrop-blur supports-[backdrop-filter]:bg-cream-surface/75 md:px-6">
      <SidebarTrigger className="-ml-1 text-chocolate-text" />
      <div className="relative hidden max-w-md flex-1 sm:block">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search orders, customers…"
          className="h-9 border-outline-variant/60 bg-white pl-9 shadow-none"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              const q = (e.target as HTMLInputElement).value.trim()
              if (q) router.push(`/admin/search?q=${encodeURIComponent(q)}`)
            }
          }}
        />
      </div>
      <div className="ml-auto flex items-center gap-1.5">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="sm:hidden"
          onClick={() => router.push("/admin/search")}
          aria-label="Search"
        >
          <Search className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="icon" aria-label="Notifications">
          <Bell className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Toggle theme"
          onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
        >
          {mounted && resolvedTheme === "dark" ? (
            <Sun className="h-4 w-4" />
          ) : (
            <Moon className="h-4 w-4" />
          )}
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-9 gap-2 px-2">
              <Avatar className="h-8 w-8 border border-outline-variant/50">
                <AvatarFallback className="bg-dadda-primary/15 text-xs font-semibold text-dadda-primary">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <span className="hidden max-w-[9rem] truncate text-sm font-medium md:inline">
                {user?.firstName || "Admin"}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col gap-0.5">
                <p className="text-sm font-medium">
                  {[user?.firstName, user?.lastName].filter(Boolean).join(" ") || "Admin"}
                </p>
                <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push("/admin/settings")}>
              <User className="mr-2 h-4 w-4" />
              Account
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              disabled={loggingOut}
              onClick={handleLogout}
              className="text-destructive focus:text-destructive"
            >
              <LogOut className="mr-2 h-4 w-4" />
              {loggingOut ? "Signing out…" : "Log out"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
