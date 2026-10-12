import type { ReactNode } from 'react'

interface CardProps {
  title?: string
  children: ReactNode
  className?: string
}

function Card({ title, children, className = '' }: CardProps) {
  return (
    <section className={`rounded-lg bg-white p-4 shadow-sm sm:p-6 ${className}`}>
      {title && <h2 className="mb-4 text-lg font-semibold">{title}</h2>}
      {children}
    </section>
  )
}

export default Card
