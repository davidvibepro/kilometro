import Button from './Button'

interface ErrorStateProps {
  message: string
  title?: string
  onRetry?: () => void
}

// Shows the server's { message }, with an optional "Try again" button
function ErrorState({ message, title = 'Something went wrong', onRetry }: ErrorStateProps) {
  return (
    <div role="alert" className="rounded-lg border border-overdue/30 bg-overdue/5 p-4">
      <p className="font-semibold text-overdue">{title}</p>
      <p className="mt-1 text-sm">{message}</p>
      {onRetry && (
        <Button variant="secondary" className="mt-3" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  )
}

export default ErrorState
