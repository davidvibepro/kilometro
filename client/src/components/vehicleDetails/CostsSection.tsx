import { useCallback, useState } from 'react'
import { getVehicleCosts } from '../../api/vehicles'
import { useApi } from '../../hooks/useApi'
import type { CostReport } from '../../types/reports'
import { formatKm, formatMonth, formatPeso } from '../../utils/format'
import Button from '../Button'
import Card from '../Card'
import EmptyState from '../EmptyState'
import ErrorState from '../ErrorState'
import Input from '../Input'
import LoadingState from '../LoadingState'
import StatTile from '../StatTile'
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

// Derived during render: each part's share of the total, in whole percent
function shareOf(part: number, total: number) {
  return total > 0 ? Math.round((part / total) * 100) : 0
}

function CostShares({ report }: { report: CostReport }) {
  const parts = [
    { label: 'Fuel', amount: report.fuel, color: 'bg-primary' },
    { label: 'Service', amount: report.service, color: 'bg-ink' },
    { label: 'Other', amount: report.other, color: 'bg-ink/40' },
  ]
  return (
    <div>
      <div className="flex h-3 overflow-hidden rounded-full bg-surface">
        {parts.map((part) => (
          <div key={part.label} className={part.color} style={{ width: `${shareOf(part.amount, report.total)}%` }} />
        ))}
      </div>
      <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink/70">
        {parts.map((part) => (
          <li key={part.label} className="flex items-center gap-1.5">
            <span className={`inline-block size-2.5 rounded-full ${part.color}`} />
            {part.label} {shareOf(part.amount, report.total)}%
          </li>
        ))}
      </ul>
    </div>
  )
}

interface CostsSectionProps {
  vehicleId: string
}

// D9: fuel, service and other costs, by month, and cost per km for a date range
function CostsSection({ vehicleId }: CostsSectionProps) {
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const loadCosts = useCallback(() => getVehicleCosts(vehicleId, from, to), [vehicleId, from, to])
  const { data, loading, error, refetch } = useApi(loadCosts)

  function renderReport() {
    if (loading) return <LoadingState message="Loading costs..." />
    if (error) return <ErrorState message={error.message} onRetry={refetch} />
    if (!data || data.total === 0) return <EmptyState message="No costs in this period." />

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
          <StatTile label="Total" value={formatPeso(data.total)} />
          <StatTile label="Fuel" value={formatPeso(data.fuel)} />
          <StatTile label="Service" value={formatPeso(data.service)} />
          <StatTile label="Other" value={formatPeso(data.other)} />
          <StatTile label="Distance" value={formatKm(data.distance)} />
          <StatTile
            label="Cost per km"
            value={data.costPerKm === null ? '—' : formatPeso(data.costPerKm)}
            hint={data.costPerKm === null ? 'No distance driven in this period' : undefined}
          />
        </div>
        <CostShares report={data} />

        <div className={nestedTableWrapperClasses}>
          <table className={tableClasses}>
            <thead>
              <tr className={theadRowClasses}>
                <th className={thClasses}>Month</th>
                <th className={`${thClasses} text-right`}>Fuel</th>
                <th className={`${thClasses} text-right`}>Service</th>
                <th className={`${thClasses} text-right`}>Other</th>
                <th className={`${thClasses} text-right`}>Total</th>
              </tr>
            </thead>
            <tbody>
              {data.monthly.map((row) => (
                <tr key={row.month} className={rowClasses}>
                  <td className={`${tdClasses} font-medium`}>{formatMonth(row.month)}</td>
                  <td className={`${tdClasses} text-right`}>{formatPeso(row.fuel)}</td>
                  <td className={`${tdClasses} text-right`}>{formatPeso(row.service)}</td>
                  <td className={`${tdClasses} text-right`}>{formatPeso(row.other)}</td>
                  <td className={`${tdClasses} text-right font-semibold`}>{formatPeso(row.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <ul className={cardListClasses}>
          {data.monthly.map((row) => (
            <li key={row.month} className={nestedCardItemClasses}>
              <div className="flex justify-between font-semibold">
                <span>{formatMonth(row.month)}</span>
                <span>{formatPeso(row.total)}</span>
              </div>
              <p className="mt-1 text-sm text-ink/70">
                Fuel {formatPeso(row.fuel)} · Service {formatPeso(row.service)} · Other {formatPeso(row.other)}
              </p>
            </li>
          ))}
        </ul>
      </div>
    )
  }

  return (
    <Card title="Costs">
      <div className="mb-4 grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
        <Input label="From" type="date" value={from} onChange={(event) => setFrom(event.target.value)} />
        <Input label="To" type="date" value={to} onChange={(event) => setTo(event.target.value)} />
        <Button
          variant="secondary"
          onClick={() => {
            setFrom('')
            setTo('')
          }}
          disabled={from === '' && to === ''}
        >
          All time
        </Button>
      </div>
      {renderReport()}
    </Card>
  )
}

export default CostsSection
