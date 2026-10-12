export type ButtonVariant = 'primary' | 'secondary' | 'danger'
export type ButtonSize = 'md' | 'sm'

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-primary text-white hover:bg-primary/90',
  secondary: 'border border-ink/20 bg-white text-ink hover:bg-surface',
  danger: 'bg-overdue text-white hover:bg-overdue/90',
}

// `sm` is for actions inside table rows and cards
const sizeClasses: Record<ButtonSize, string> = {
  md: 'px-4 py-2 text-sm',
  sm: 'px-3 py-1.5 text-xs',
}

// Shared by <Button> and <ButtonLink>, so a link that looks like a button matches exactly
export function buttonClasses(variant: ButtonVariant, size: ButtonSize = 'md'): string {
  return `inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-60 ${sizeClasses[size]} ${variantClasses[variant]}`
}
