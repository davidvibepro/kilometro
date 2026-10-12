import type { ServiceStatus } from '../types/reports'
import { serviceStatusLabels } from '../utils/labels'

// The three status colors from the theme (index.css)
const statusClasses: Record<ServiceStatus, string> = {
  overdue: 'bg-overdue text-white',
  due_soon: 'bg-due-soon text-white',
  ok: 'bg-ok/10 text-ok',
}

interface ServiceStatusBadgeProps {
  status: ServiceStatus
}

function ServiceStatusBadge({ status }: ServiceStatusBadgeProps) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusClasses[status]}`}>
      {serviceStatusLabels[status]}
    </span>
  )
}

export default ServiceStatusBadge
