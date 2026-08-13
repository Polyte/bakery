"use client"

import { useState } from "react"
import { Check, Copy } from "lucide-react"
import { bankingFields } from "@/lib/banking"

export default function BankingDetailsCard({ compact = false }: { compact?: boolean }) {
  const [copied, setCopied] = useState<string | null>(null)

  const copyValue = async (label: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(label)
      window.setTimeout(() => setCopied((current) => (current === label ? null : current)), 1600)
    } catch {
      setCopied(null)
    }
  }

  return (
    <dl className="overflow-hidden rounded-xl bg-surface shadow-sm">
      {bankingFields().map((field) => (
        <div
          key={field.label}
          className={`flex items-center justify-between gap-4 border-b border-outline-variant/30 last:border-b-0 ${compact ? "px-3 py-2" : "px-4 py-3"}`}
        >
          <div className="min-w-0">
            <dt className="text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant">{field.label}</dt>
            <dd className={`mt-0.5 truncate font-medium text-chocolate-text ${compact ? "text-sm" : ""}`}>{field.value}</dd>
          </div>
          <button
            type="button"
            onClick={() => copyValue(field.label, field.value)}
            className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-dadda-primary hover:bg-primary-container/40"
            aria-label={`Copy ${field.label}`}
          >
            {copied === field.label ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            {copied === field.label ? "Copied" : "Copy"}
          </button>
        </div>
      ))}
    </dl>
  )
}
