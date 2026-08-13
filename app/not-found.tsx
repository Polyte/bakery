import Link from "next/link"

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-6 py-24 text-center">
      <p className="font-display text-sm uppercase tracking-[0.2em] text-primary">404</p>
      <h1 className="mt-4 font-display text-4xl text-on-surface">Page not found</h1>
      <p className="mt-3 text-on-surface/70">
        That page is not on the menu. Head back to the bakery to keep browsing cakes and treats.
      </p>
      <Link
        href="/"
        className="mt-8 rounded-full bg-primary px-6 py-3 text-sm font-medium text-white transition hover:opacity-90"
      >
        Back to home
      </Link>
    </div>
  )
}
