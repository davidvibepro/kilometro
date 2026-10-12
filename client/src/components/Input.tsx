import { useId, type ComponentProps } from 'react'
import FieldError from './FieldError'

interface InputProps extends ComponentProps<'input'> {
  label: string
  error?: string
}

// Works with React Hook Form: {...register('name')} passes name, onChange, onBlur and ref
function Input({ label, error, id, className = '', ...props }: InputProps) {
  const generatedId = useId()
  const inputId = id ?? generatedId

  return (
    <div className={className}>
      <label htmlFor={inputId} className="mb-1 block text-sm font-medium">
        {label}
      </label>
      <input
        id={inputId}
        aria-invalid={error ? true : undefined}
        className={`w-full rounded-lg border bg-white px-3 py-2 text-sm text-ink focus:border-primary focus:ring-2 focus:ring-primary/30 focus:outline-none ${error ? 'border-overdue' : 'border-ink/20'}`}
        {...props}
      />
      <FieldError message={error} />
    </div>
  )
}

export default Input
