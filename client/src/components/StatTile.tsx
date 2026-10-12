interface StatTileProps {
  label: string
  value: string
  hint?: string
}

// One number with its label, e.g. "Average · 45 km/L"
function StatTile({ label, value, hint }: StatTileProps) {
  return (
    <div className="rounded-lg bg-surface p-4">
      <p className="text-xs font-semibold tracking-wide text-ink/60 uppercase">{label}</p>
      <p className="mt-1 text-xl font-bold">{value}</p>
      {hint && <p className="mt-1 text-xs text-ink/60">{hint}</p>}
    </div>
  )
}

export default StatTile
