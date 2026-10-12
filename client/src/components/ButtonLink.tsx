import { Link, type LinkProps } from 'react-router'
import { buttonClasses, type ButtonVariant } from './buttonStyles'

interface ButtonLinkProps extends LinkProps {
  variant?: ButtonVariant
}

// A router link that looks like a <Button>, e.g. "Add vehicle" going to /vehicles/new
function ButtonLink({ variant = 'primary', className = '', ...props }: ButtonLinkProps) {
  return <Link className={`${buttonClasses(variant)} ${className}`} {...props} />
}

export default ButtonLink
