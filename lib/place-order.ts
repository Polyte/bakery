import type { CakeDraft } from "@/lib/cake-order"

export async function notifyOrderEmails(draft: CakeDraft) {
  try {
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ draft }),
    })
    if (!res.ok) {
      console.error("Order email request failed:", await res.text())
      return false
    }
    const data = (await res.json()) as { emailed?: boolean }
    return Boolean(data.emailed)
  } catch (error) {
    console.error("Order email request failed:", error)
    return false
  }
}
