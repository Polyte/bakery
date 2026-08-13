"use client"

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react"

type AccountProfile = {
  id: string
  email: string
  firstName: string
  lastName: string
  phone: string
}

export type CheckoutAccountHandle = {
  ensure: () => Promise<{ ok: true; keepCustomer: boolean } | { ok: false; error: string }>
}

type Props = {
  customer: {
    firstName: string
    lastName: string
    email: string
    phone: string
  }
  onPrefill: (profile: Pick<AccountProfile, "firstName" | "lastName" | "email" | "phone">) => void
}

export const CheckoutAccount = forwardRef<CheckoutAccountHandle, Props>(function CheckoutAccount(
  { customer, onPrefill },
  ref,
) {
  const [user, setUser] = useState<AccountProfile | null>(null)
  const [createAccount, setCreateAccount] = useState(false)
  const [showSignIn, setShowSignIn] = useState(false)
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [signInPassword, setSignInPassword] = useState("")
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const onPrefillRef = useRef(onPrefill)
  onPrefillRef.current = onPrefill

  useEffect(() => {
    let cancelled = false
    fetch("/api/account/me")
      .then((res) => res.json())
      .then((data: { user?: AccountProfile | null }) => {
        if (cancelled || !data.user) return
        setUser(data.user)
        onPrefillRef.current({
          firstName: data.user.firstName,
          lastName: data.user.lastName,
          email: data.user.email,
          phone: data.user.phone,
        })
      })
      .catch(() => {
        /* stay signed out */
      })
    return () => {
      cancelled = true
    }
  }, [])

  useImperativeHandle(ref, () => ({
    async ensure() {
      if (user) return { ok: true, keepCustomer: true }
      if (!createAccount) return { ok: true, keepCustomer: false }
      if (password.length < 8) {
        return { ok: false, error: "Use at least 8 characters for your password." }
      }
      if (password !== confirmPassword) {
        return { ok: false, error: "Passwords do not match." }
      }
      try {
        const res = await fetch("/api/account/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: customer.email,
            password,
            firstName: customer.firstName,
            lastName: customer.lastName,
            phone: customer.phone,
          }),
        })
        const data = (await res.json()) as { user?: AccountProfile; error?: string }
        if (!res.ok || !data.user) {
          return { ok: false, error: data.error ?? "Could not create the account." }
        }
        setUser(data.user)
        return { ok: true, keepCustomer: true }
      } catch {
        return { ok: false, error: "Could not create the account. Please try again." }
      }
    },
  }))

  const signIn = async (e: React.FormEvent) => {
    e.preventDefault()
    if (busy) return
    setBusy(true)
    setMessage(null)
    try {
      const res = await fetch("/api/account/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: customer.email, password: signInPassword }),
      })
      const data = (await res.json()) as { user?: AccountProfile; error?: string }
      if (!res.ok || !data.user) {
        setMessage(data.error ?? "Could not sign in.")
        return
      }
      setUser(data.user)
      setShowSignIn(false)
      onPrefill({
        firstName: data.user.firstName,
        lastName: data.user.lastName,
        email: data.user.email,
        phone: data.user.phone,
      })
    } catch {
      setMessage("Could not sign in. Please try again.")
    } finally {
      setBusy(false)
    }
  }

  if (user) {
    return (
      <p className="sm:col-span-2 text-sm text-on-surface-variant">
        Signed in as <span className="font-semibold text-chocolate-text">{user.email}</span>. We&apos;ll keep your
        details for next time.
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-4 sm:col-span-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-on-surface-variant">Returning customer?</p>
        <button
          type="button"
          className="text-sm font-semibold uppercase tracking-wider text-dadda-primary hover:text-chocolate-text"
          onClick={() => setShowSignIn((open) => !open)}
        >
          {showSignIn ? "Hide sign in" : "Sign in"}
        </button>
      </div>
      {showSignIn ? (
        <form className="grid gap-3 rounded-md bg-surface p-4 shadow-sm sm:grid-cols-2" onSubmit={signIn}>
          <p className="sm:col-span-2 text-sm text-on-surface-variant">
            Use the email above and your password.
          </p>
          <div className="flex flex-col gap-2 sm:col-span-2">
            <label className="text-sm font-semibold uppercase tracking-wider text-on-surface-variant" htmlFor="signin-password">
              Password
            </label>
            <input
              id="signin-password"
              type="password"
              autoComplete="current-password"
              className="w-full rounded-md bg-surface-container px-4 py-3 text-on-surface shadow-sm outline-none"
              value={signInPassword}
              onChange={(e) => setSignInPassword(e.target.value)}
              required
            />
          </div>
          {message ? (
            <p className="sm:col-span-2 text-sm text-chocolate-text" role="alert">
              {message}
            </p>
          ) : null}
          <button
            type="submit"
            disabled={busy}
            className="rounded-full bg-dadda-primary px-5 py-3 text-sm font-semibold uppercase tracking-widest text-on-primary disabled:opacity-60 sm:col-span-2"
          >
            {busy ? "Signing in…" : "Sign in"}
          </button>
        </form>
      ) : null}

      <label className="flex cursor-pointer items-start gap-3 rounded-md bg-surface px-4 py-3 shadow-sm">
        <input
          id="create-account"
          type="checkbox"
          className="mt-1 h-4 w-4 shrink-0 accent-dadda-primary"
          checked={createAccount}
          onChange={(e) => setCreateAccount(e.target.checked)}
        />
        <span>
          <span className="block text-sm font-semibold text-chocolate-text">Create an account for next time</span>
          <span className="mt-1 block text-sm text-on-surface-variant">
            Save your name, email, and phone so checkout is quicker on your next order.
          </span>
        </span>
      </label>

      {createAccount ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold uppercase tracking-wider text-on-surface-variant" htmlFor="new-password">
              Password
            </label>
            <input
              id="new-password"
              type="password"
              autoComplete="new-password"
              className="w-full rounded-md bg-surface px-4 py-3 text-on-surface shadow-sm outline-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={8}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold uppercase tracking-wider text-on-surface-variant" htmlFor="confirm-password">
              Confirm password
            </label>
            <input
              id="confirm-password"
              type="password"
              autoComplete="new-password"
              className="w-full rounded-md bg-surface px-4 py-3 text-on-surface shadow-sm outline-none"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              minLength={8}
            />
          </div>
        </div>
      ) : null}
    </div>
  )
})
