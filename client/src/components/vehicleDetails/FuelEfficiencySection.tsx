import { useCallback } from 'react'
import { getFuelEfficiency } from '../../api/vehicles'
import { useApi } from '../../hooks/useApi'
import { formatDate, formatKm, formatKmPerLiter } from '../../utils/format'
import Card from '../Card'
import EmptyState from '../EmptyState'
import ErrorState from '../ErrorState'
import LoadingState from '../LoadingState'
import StatTile from '../StatTile'

interface FuelEfficiencySectionProps {
  vehicleId: string
}

// D8: km per liter between full-tank fill-ups
function FuelEfficiencySection({ vehicleId }: FuelEfficiencySectionProps) {
  const loadEfficiency = useCallback(() => getFuelEfficiency(vehicleId), [vehicleId])
  const { data, loading, error, refetch } = useApi(loadEfficiency)

  function renderEfficiency() {
    if (loading) return <LoadingState message="Loading fuel efficiency..." />
    if (error) return <ErrorState message={error.message} onRetry={refetch} />
    if (!data || data.average === null) {
      return <EmptyState message={data?.message ?? 'Need at least two full-tank fill-ups'} />
    }

    // Derived during render: only the fill-ups more than 15% below the average
    const flagged = data.entries.filter((entry) => entry.flagged)

    return (
      <div className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-3">
          <StatTile label="Average" value={formatKmPerLiter(data.average)} hint={`${data.entries.length} full-tank fill-ups`} />
          <StatTile label="Best" value={formatKmPerLiter(data.best ?? 0)} />
          <StatTile label="Worst" value={formatKmPerLiter(data.worst ?? 0)} />
        </div>
        {flagged.length === 0 ? (
          <p className="text-sm text-ink/70">No fill-up is more than 15% below the average.</p>
        ) : (
          <div>
            <p className="text-sm font-semibold text-overdue">
              {flagged.length} fill-up{flagged.length === 1 ? ' is' : 's are'} more than 15% below the average:
            </p>
            <ul className="mt-2 space-y-1 text-sm">
              {flagged.map((entry) => (
                <li key={entry.fuelLogId}>
                  {formatDate(entry.date)} at {formatKm(entry.odometer)}: {formatKmPerLiter(entry.kmPerLiter)}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    )
  }

  return <Card title="Fuel efficiency">{renderEfficiency()}</Card>
}

export default FuelEfficiencySection
