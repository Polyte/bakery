"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronRight } from "lucide-react"
import { adminNav, type NavItem } from "@/lib/admin/nav"
import { cn } from "@/lib/utils"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
} from "@/components/ui/sidebar"

function isActivePath(pathname: string, href?: string) {
  if (!href) return false
  const base = href.split("?")[0]
  if (base === "/admin") return pathname === "/admin"
  return pathname === base || pathname.startsWith(`${base}/`)
}

function groupHasActive(pathname: string, item: NavItem) {
  if (item.href && isActivePath(pathname, item.href)) return true
  return item.children?.some((child) => isActivePath(pathname, child.href)) ?? false
}

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="border-b border-sidebar-border px-4 py-4">
        <Link href="/admin" className="flex items-center gap-2 overflow-hidden">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-dadda-primary text-sm font-semibold text-white">
            D
          </span>
          <div className="flex min-w-0 flex-col group-data-[collapsible=icon]:hidden">
            <span className="truncate font-display text-lg font-semibold leading-none text-chocolate-text">
              Dadda&apos;s
            </span>
            <span className="truncate text-[11px] uppercase tracking-wider text-muted-foreground">
              Admin
            </span>
          </div>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {adminNav.map((item) => {
                const Icon = item.icon
                const active = groupHasActive(pathname, item)

                if (!item.children?.length) {
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        isActive={active}
                        tooltip={item.title}
                      >
                        <Link href={item.href || "/admin"}>
                          <Icon />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                }

                return (
                  <Collapsible
                    key={item.title}
                    asChild
                    defaultOpen={active}
                    className="group/collapsible"
                  >
                    <SidebarMenuItem>
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton
                          tooltip={item.title}
                          isActive={active}
                          className={cn(active && "bg-sidebar-accent")}
                        >
                          <Icon />
                          <span>{item.title}</span>
                          <ChevronRight className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90" />
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <SidebarMenuSub>
                          {item.children.map((child) => (
                            <SidebarMenuSubItem key={child.href}>
                              <SidebarMenuSubButton
                                asChild
                                isActive={isActivePath(pathname, child.href)}
                              >
                                <Link href={child.href}>{child.title}</Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          ))}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </SidebarMenuItem>
                  </Collapsible>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
