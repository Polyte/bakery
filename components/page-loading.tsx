export default function PageLoading() {
  return (
    <div
      className="flex min-h-[55vh] w-full items-center justify-center bg-surface pt-32"
      aria-busy="true"
      aria-live="polite"
      aria-label="Loading page"
    >
      <div className="flex flex-col items-center gap-4">
        <div className="h-11 w-11 animate-pulse rounded-full bg-dadda-primary/25" />
        <p className="text-sm font-medium tracking-wide text-on-surface-variant">Loading…</p>
      </div>
    </div>
  )
}
