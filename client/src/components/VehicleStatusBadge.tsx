import type { VehicleStatus } from '../types/vehicle'
import { vehicleStatusLabels } from '../utils/labels'

const statusClasses: Record<VehicleStatus, string> = {
  active: 'bg-ok/10 text-ok',
  in_shop: 'bg-due-soon/10 text-due-soon',
  retired: 'bg-ink/10 text-ink/70',
}

interface VehicleStatusBadgeProps {
  status: VehicleStatus
}

function VehicleStatusBadge({ status }: VehicleStatusBadgeProps) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusClasses[status]}`}>
      {vehicleStatusLabels[status]}
    </span>
  )
}

export default VehicleStatusBadge
