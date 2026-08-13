import type { ReactNode } from "react"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type MetricCardProps = {
  title: string
  value: ReactNode
  description?: string
  icon?: ReactNode
  trend?: ReactNode
  className?: string
}

export function MetricCard({
  title,
  value,
  description,
  icon,
  trend,
  className,
}: MetricCardProps) {
  return (
    <Card className={cn("border-outline-variant/50 bg-card shadow-sm", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        {icon ? <div className="text-dadda-primary/80">{icon}</div> : null}
      </CardHeader>
      <CardContent>
        <div className="font-display text-2xl font-semibold tracking-tight text-chocolate-text">
          {value}
        </div>
        {description || trend ? (
          <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
            {trend}
            {description ? <span>{description}</span> : null}
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}
