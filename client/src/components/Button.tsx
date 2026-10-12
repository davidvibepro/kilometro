import type { ComponentProps } from 'react'
import { buttonClasses, type ButtonVariant } from './buttonStyles'

interface ButtonProps extends ComponentProps<'button'> {
  variant?: ButtonVariant
}

function Button({ variant = 'primary', type = 'button', className = '', ...props }: ButtonProps) {
  return <button type={type} className={`${buttonClasses(variant)} ${className}`} {...props} />
}

export default Button
