"use client"

import { Button } from "@/components/ui/button"

type PaginationProps = {
  page: number
  pageCount: number
  total?: number
  onPageChange: (page: number) => void
  disabled?: boolean
}

export function AdminPagination({
  page,
  pageCount,
  total,
  onPageChange,
  disabled,
}: PaginationProps) {
  if (pageCount <= 1) {
    return total != null ? (
      <p className="text-sm text-muted-foreground">{total} result{total === 1 ? "" : "s"}</p>
    ) : null
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <p className="text-sm text-muted-foreground">
        Page {page} of {pageCount}
        {total != null ? ` · ${total} total` : ""}
      </p>
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={disabled || page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          Previous
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={disabled || page >= pageCount}
          onClick={() => onPageChange(page + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  )
}
