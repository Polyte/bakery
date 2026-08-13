import type { ReactNode } from "react"
import { cn } from "@/lib/utils"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export type DataTableColumn<T> = {
  key: string
  header: ReactNode
  className?: string
  cell: (row: T) => ReactNode
}

type DataTableProps<T> = {
  columns: DataTableColumn<T>[]
  data: T[]
  searchSlot?: ReactNode
  toolbar?: ReactNode
  empty?: ReactNode
  rowKey: (row: T) => string
  className?: string
}

export function DataTable<T>({
  columns,
  data,
  searchSlot,
  toolbar,
  empty,
  rowKey,
  className,
}: DataTableProps<T>) {
  return (
    <div className={cn("space-y-3", className)}>
      {(searchSlot || toolbar) && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="w-full sm:max-w-sm">{searchSlot}</div>
          {toolbar ? <div className="flex flex-wrap items-center gap-2">{toolbar}</div> : null}
        </div>
      )}
      <div className="overflow-hidden rounded-xl border border-outline-variant/50 bg-card">
        <Table>
          <TableHeader>
            <TableRow className="bg-surface-container-low/60 hover:bg-surface-container-low/60">
              {columns.map((col) => (
                <TableHead key={col.key} className={cn("text-chocolate-text", col.className)}>
                  {col.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-32 text-center">
                  {empty || <span className="text-sm text-muted-foreground">No results</span>}
                </TableCell>
              </TableRow>
            ) : (
              data.map((row) => (
                <TableRow key={rowKey(row)}>
                  {columns.map((col) => (
                    <TableCell key={col.key} className={col.className}>
                      {col.cell(row)}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
