import { useCallback } from 'react'
import { getServiceSchedule } from '../../api/vehicles'
import { useApi } from '../../hooks/useApi'
import type { ScheduleItem } from '../../types/reports'
import { formatDate, formatKm, formatRemaining } from '../../utils/format'
import ButtonLink from '../ButtonLink'
import Card from '../Card'
import EmptyState from '../EmptyState'
import ErrorState from '../ErrorState'
import LoadingState from '../LoadingState'
import ServiceStatusBadge from '../ServiceStatusBadge'
import {
  nestedCardItemClasses,
  cardListClasses,
  rowClasses,
  tableClasses,
  nestedTableWrapperClasses,
  tdClasses,
  theadRowClasses,
  thClasses,
} from '../tableStyles'

// "Oct 1, 2026 · 52,200 km", or a note when the service was never logged (D6 baseline)
function lastDoneText(item: ScheduleItem) {
  if (!item.lastServiceLogId) return 'Not logged yet'
  return `${formatDate(item.lastDate)} · ${formatKm(item.lastKm)}`
}

// "52,400 km or Dec 1, 2026": whichever limits this service has
function nextDueText(item: ScheduleItem) {
  const limits: string[] = []
  if (item.nextDueKm !== null) limits.push(formatKm(item.nextDueKm))
  if (item.nextDueDate !== null) limits.push(formatDate(item.nextDueDate))
  return limits.join(' or ')
}

interface ScheduleSectionProps {
  vehicleId: string
}

// D6: when each service is next due for this vehicle
function ScheduleSection({ vehicleId }: ScheduleSectionProps) {
  const loadSchedule = useCallback(() => getServiceSchedule(vehicleId), [vehicleId])
  const { data, loading, error, refetch } = useApi(loadSchedule)

  function renderSchedule() {
    if (loading) return <LoadingState message="Loading service schedule..." />
    if (error) return <ErrorState message={error.message} onRetry={refetch} />
    if (!data || data.items.length === 0) {
      return (
        <EmptyState
          message="No service types apply to this kind of vehicle yet."
          action={<ButtonLink to="/service-types">Manage service types</ButtonLink>}
        />
      )
    }

    return (
      <>
        <div className={nestedTableWrapperClasses}>
          <table className={tableClasses}>
            <thead>
              <tr className={theadRowClasses}>
                <th className={thClasses}>Service</th>
                <th className={thClasses}>Last done</th>
                <th className={thClasses}>Next due</th>
                <th className={thClasses}>Remaining</th>
                <th className={thClasses}>Status</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((item) => (
                <tr key={item.serviceType._id} className={rowClasses}>
                  <td className={`${tdClasses} font-medium`}>{item.serviceType.name}</td>
                  <td className={tdClasses}>{lastDoneText(item)}</td>
                  <td className={tdClasses}>{nextDueText(item)}</td>
                  <td className={tdClasses}>{formatRemaining(item.kmRemaining, item.daysRemaining)}</td>
                  <td className={tdClasses}>
                    <ServiceStatusBadge status={item.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <ul className={cardListClasses}>
          {data.items.map((item) => (
            <li key={item.serviceType._id} className={nestedCardItemClasses}>
              <div className="flex items-start justify-between gap-3">
                <p className="font-semibold">{item.serviceType.name}</p>
                <ServiceStatusBadge status={item.status} />
              </div>
              <p className="mt-1 text-sm">{formatRemaining(item.kmRemaining, item.daysRemaining)}</p>
              <p className="text-sm text-ink/70">Next due: {nextDueText(item)}</p>
              <p className="text-sm text-ink/70">Last done: {lastDoneText(item)}</p>
            </li>
          ))}
        </ul>
      </>
    )
  }

  return <Card title="Service schedule">{renderSchedule()}</Card>
}

export default ScheduleSection
