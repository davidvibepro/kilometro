import { useId, type ComponentProps } from 'react'
import FieldError from './FieldError'

export interface SelectOption {
  value: string
  label: string
}

interface SelectProps extends ComponentProps<'select'> {
  label: string
  options: SelectOption[]
  placeholder?: string
  error?: string
}

function Select({ label, options, placeholder, error, id, className = '', ...props }: SelectProps) {
  const generatedId = useId()
  const selectId = id ?? generatedId

  return (
    <div className={className}>
      <label htmlFor={selectId} className="mb-1 block text-sm font-medium">
        {label}
      </label>
      <select
        id={selectId}
        aria-invalid={error ? true : undefined}
        className={`w-full rounded-lg border bg-white px-3 py-2 text-sm text-ink focus:border-primary focus:ring-2 focus:ring-primary/30 focus:outline-none ${error ? 'border-overdue' : 'border-ink/20'}`}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <FieldError message={error} />
    </div>
  )
}

export default Select
