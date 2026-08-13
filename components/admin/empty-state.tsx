import type { ReactNode } from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

type EmptyStateProps = {
  title: string
  description?: string
  icon?: ReactNode
  action?: {
    label: string
    onClick?: () => void
    href?: string
  }
  className?: string
}

export function EmptyState({ title, description, icon, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-xl border border-dashed border-outline-variant/70 bg-surface-container-low/40 px-6 py-12 text-center",
        className
      )}
    >
      {icon ? <div className="mb-3 text-dadda-primary/70">{icon}</div> : null}
      <h3 className="font-display text-lg font-semibold text-chocolate-text">{title}</h3>
      {description ? (
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>
      ) : null}
      {action ? (
        action.href ? (
          <Button asChild className="mt-4 bg-dadda-primary hover:bg-dadda-primary-dark">
            <Link href={action.href}>{action.label}</Link>
          </Button>
        ) : (
          <Button
            type="button"
            className="mt-4 bg-dadda-primary hover:bg-dadda-primary-dark"
            onClick={action.onClick}
          >
            {action.label}
          </Button>
        )
      ) : null}
    </div>
  )
}
