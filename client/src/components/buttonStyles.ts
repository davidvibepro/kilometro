export type ButtonVariant = 'primary' | 'secondary' | 'danger'

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-primary text-white hover:bg-primary/90',
  secondary: 'border border-ink/20 bg-white text-ink hover:bg-surface',
  danger: 'bg-overdue text-white hover:bg-overdue/90',
}

// Shared by <Button> and <ButtonLink>, so a link that looks like a button matches exactly
export function buttonClasses(variant: ButtonVariant): string {
  return `inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-60 ${variantClasses[variant]}`
}
