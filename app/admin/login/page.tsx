"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [error, setError] = React.useState<string | null>(null)
  const [loading, setLoading] = React.useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const res = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(typeof data.error === "string" ? data.error : "Invalid email or password")
        return
      }
      router.push("/admin")
      router.refresh()
    } catch {
      setError("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-svh items-center justify-center overflow-hidden px-4 py-10">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(212,163,115,0.35),_transparent_55%),linear-gradient(180deg,#fff8ef_0%,#f5edde_100%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 top-16 h-72 w-72 rounded-full bg-dadda-primary/10 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -left-16 bottom-10 h-64 w-64 rounded-full bg-primary-container/30 blur-3xl"
      />

      <Card className="relative z-10 w-full max-w-md border-outline-variant/60 bg-cream-surface/95 shadow-pastry backdrop-blur">
        <CardHeader className="space-y-3 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-dadda-primary font-display text-xl font-semibold text-white">
            D
          </div>
          <div>
            <CardTitle className="font-display text-2xl text-chocolate-text">
              Dadda&apos;s Admin
            </CardTitle>
            <CardDescription className="mt-1">
              Sign in to manage orders, products, and the bakery.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="username"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@daddasconfectionery.co.za"
                className="bg-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-white"
              />
            </div>
            {error ? (
              <p className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                {error}
              </p>
            ) : null}
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-dadda-primary text-white hover:bg-dadda-primary-dark"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Signing in…
                </>
              ) : (
                "Sign in"
              )}
            </Button>
          </form>
          {process.env.NODE_ENV === "development" ? (
            <p className="mt-4 text-center text-xs text-muted-foreground">
              Dev seed: admin@daddasconfectionery.co.za / admin123!
            </p>
          ) : null}
        </CardContent>
      </Card>
    </div>
  )
}
