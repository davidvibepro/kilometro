import type { ReactNode } from 'react'

interface EmptyStateProps {
  message: string
  action?: ReactNode
}

function EmptyState({ message, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-lg border-2 border-dashed border-ink/20 bg-white px-4 py-12 text-center">
      <p className="text-sm text-ink/70">{message}</p>
      {action}
    </div>
  )
}

export default EmptyState
