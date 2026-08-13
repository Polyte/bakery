/** Merchant Yoco Payment Page. Amount is in Rands, not cents. */
export const YOCO_PAYMENT_PAGE_URL = "https://pay.yoco.com/daddas-confectionery"

/** Matches formatRand: two decimal places, numbers and a decimal point only. */
export function yocoPageAmount(amount: number) {
  return amount.toFixed(2)
}

/**
 * Yoco Payment Page query params (case-sensitive):
 * amount, reference, firstName, lastName, email, redirectOnPaymentSuccess
 * @see https://support.yoco.help/en/articles/109565-setting-up-an-online-payment-page
 */
export function buildYocoPaymentPageUrl(input: {
  amount: number
  reference?: string | null
  firstName?: string
  lastName?: string
  email?: string
  successUrl?: string
}) {
  const url = new URL(YOCO_PAYMENT_PAGE_URL)
  url.searchParams.set("amount", yocoPageAmount(input.amount))
  if (input.reference) url.searchParams.set("reference", input.reference)
  if (input.firstName) url.searchParams.set("firstName", input.firstName)
  if (input.lastName) url.searchParams.set("lastName", input.lastName)
  if (input.email) url.searchParams.set("email", input.email)
  if (input.successUrl) url.searchParams.set("redirectOnPaymentSuccess", input.successUrl)
  return url.toString()
}
