interface LoadingStateProps {
  message?: string
}

function LoadingState({ message = 'Loading...' }: LoadingStateProps) {
  return (
    <div role="status" className="flex items-center justify-center gap-3 py-12 text-sm text-ink/70">
      <span
        aria-hidden="true"
        className="size-5 animate-spin rounded-full border-2 border-primary border-t-transparent"
      />
      {message}
    </div>
  )
}

export default LoadingState
