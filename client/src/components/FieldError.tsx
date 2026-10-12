interface FieldErrorProps {
  message?: string
}

// The error message under one form field (from Zod or the server)
function FieldError({ message }: FieldErrorProps) {
  if (!message) return null
  return <p className="mt-1 text-sm text-overdue">{message}</p>
}

export default FieldError
