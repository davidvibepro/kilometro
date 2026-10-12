import { useCallback, useState } from 'react'
import { Link } from 'react-router'
import { getVehicleCosts, getVehicles } from '../api/vehicles'
import Button from '../components/Button'
import Card from '../components/Card'
import EmptyState from '../components/EmptyState'
import ErrorState from '../components/ErrorState'
import Input from '../components/Input'
import LoadingState from '../components/LoadingState'
import PageHeader from '../components/PageHeader'
import StatTile from '../components/StatTile'
import {
  linkClasses,
  nestedCardItemClasses,
  nestedTableWrapperClasses,
  rowClasses,
  tableClasses,
  tdClasses,
  theadRowClasses,
  thClasses,
} from '../components/tableStyles'
import VehicleStatusBadge from '../components/VehicleStatusBadge'
import { useApi } from '../hooks/useApi'
import type { CostTotals } from '../types/reports'
import { formatKm, formatMonth, formatPeso } from '../utils/format'

// Loads the D9 cost report of every vehicle for the same date range
async function loadReports(from: string, to: string) {
  const vehicles = await getVehicles()
  const reports = await Promise.all(vehicles.map((vehicle) => getVehicleCosts(vehicle._id, from, to)))
  return vehicles.map((vehicle, index) => ({ vehicle, report: reports[index] }))
}

type VehicleReports = Awaited<ReturnType<typeof loadReports>>

const emptyTotals = (): CostTotals => ({ fuel: 0, service: 0, other: 0, total: 0 })

function addTotals(sum: CostTotals, part: CostTotals) {
  sum.fuel += part.fuel
  sum.service += part.service
  sum.other += part.other
  sum.total += part.total
}

// Derived during render: one row per month for the whole fleet, oldest month first
function monthlyFleetTotals(rows: VehicleReports) {
  const byMonth = new Map<string, CostTotals>()
  for (const { report } of rows) {
    for (const month of report.monthly) {
      if (!byMonth.has(month.month)) byMonth.set(month.month, emptyTotals())
      addTotals(byMonth.get(month.month)!, month)
    }
  }
  return [...byMonth.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([month, totals]) => ({ month, ...totals }))
}

function ByMonth({ rows }: { rows: VehicleReports }) {
  const months = monthlyFleetTotals(rows)
  const highest = Math.max(...months.map((month) => month.total))

  return (
    <Card title="By month">
      <div className={nestedTableWrapperClasses}>
        <table className={tableClasses}>
          <thead>
            <tr className={theadRowClasses}>
              <th className={thClasses}>Month</th>
              <th className={`${thClasses} text-right`}>Fuel</th>
              <th className={`${thClasses} text-right`}>Service</th>
              <th className={`${thClasses} text-right`}>Other</th>
              <th className={`${thClasses} text-right`}>Total</th>
              <th className={`${thClasses} w-1/4`}></th>
            </tr>
          </thead>
          <tbody>
            {months.map((month) => (
              <tr key={month.month} className={rowClasses}>
                <td className={`${tdClasses} font-medium whitespace-nowrap`}>{formatMonth(month.month)}</td>
                <td className={`${tdClasses} text-right`}>{formatPeso(month.fuel)}</td>
                <td className={`${tdClasses} text-right`}>{formatPeso(month.service)}</td>
                <td className={`${tdClasses} text-right`}>{formatPeso(month.other)}</td>
                <td className={`${tdClasses} text-right font-semibold`}>{formatPeso(month.total)}</td>
                <td className={tdClasses}>
                  <div className="mt-1.5 h-2 rounded-full bg-surface">
                    <div className="h-2 rounded-full bg-primary" style={{ width: `${(month.total / highest) * 100}%` }} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="space-y-3 md:hidden">
        {months.map((month) => (
          <li key={month.month} className={nestedCardItemClasses}>
            <div className="flex justify-between font-semibold">
              <span>{formatMonth(month.month)}</span>
              <span>{formatPeso(month.total)}</span>
            </div>
            <div className="mt-2 h-2 rounded-full bg-white">
              <div className="h-2 rounded-full bg-primary" style={{ width: `${(month.total / highest) * 100}%` }} />
            </div>
            <p className="mt-2 text-sm text-ink/70">
              Fuel {formatPeso(month.fuel)} · Service {formatPeso(month.service)} · Other {formatPeso(month.other)}
            </p>
          </li>
        ))}
      </ul>
    </Card>
  )
}

function ByVehicle({ rows }: { rows: VehicleReports }) {
  // Derived during render: the vehicles that cost the most come first
  const sorted = [...rows].sort((a, b) => b.report.total - a.report.total)

  return (
    <Card title="By vehicle">
      <div className={nestedTableWrapperClasses}>
        <table className={tableClasses}>
          <thead>
            <tr className={theadRowClasses}>
              <th className={thClasses}>Vehicle</th>
              <th className={`${thClasses} text-right`}>Fuel</th>
              <th className={`${thClasses} text-right`}>Service</th>
              <th className={`${thClasses} text-right`}>Other</th>
              <th className={`${thClasses} text-right`}>Total</th>
              <th className={`${thClasses} text-right`}>Distance</th>
              <th className={`${thClasses} text-right`}>Per km</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map(({ vehicle, report }) => (
              <tr key={vehicle._id} className={rowClasses}>
                <td className={tdClasses}>
                  <Link to={`/vehicles/${vehicle._id}`} className={linkClasses}>
                    {vehicle.plateNumber}
                  </Link>
                  <p className="text-xs text-ink/60">
                    {vehicle.make} {vehicle.model}
                  </p>
                  {vehicle.status !== 'active' && <VehicleStatusBadge status={vehicle.status} />}
                </td>
                <td className={`${tdClasses} text-right`}>{formatPeso(report.fuel)}</td>
                <td className={`${tdClasses} text-right`}>{formatPeso(report.service)}</td>
                <td className={`${tdClasses} text-right`}>{formatPeso(report.other)}</td>
                <td className={`${tdClasses} text-right font-semibold`}>{formatPeso(report.total)}</td>
                <td className={`${tdClasses} text-right whitespace-nowrap`}>{formatKm(report.distance)}</td>
                <td className={`${tdClasses} text-right`}>
                  {report.costPerKm === null ? '—' : formatPeso(report.costPerKm)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="space-y-3 md:hidden">
        {sorted.map(({ vehicle, report }) => (
          <li key={vehicle._id} className={nestedCardItemClasses}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <Link to={`/vehicles/${vehicle._id}`} className={linkClasses}>
                  {vehicle.plateNumber}
                </Link>
                <p className="text-sm text-ink/70">
                  {vehicle.make} {vehicle.model}
                </p>
              </div>
              <span className="font-semibold">{formatPeso(report.total)}</span>
            </div>
            <p className="mt-1 text-sm text-ink/70">
              Fuel {formatPeso(report.fuel)} · Service {formatPeso(report.service)} · Other {formatPeso(report.other)}
            </p>
            <p className="text-sm text-ink/70">
              {formatKm(report.distance)} driven ·{' '}
              {report.costPerKm === null ? 'no distance' : `${formatPeso(report.costPerKm)} per km`}
            </p>
          </li>
        ))}
      </ul>
    </Card>
  )
}

function ReportsPage() {
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const loadPage = useCallback(() => loadReports(from, to), [from, to])
  const { data: rows, loading, error, refetch } = useApi(loadPage)

  function renderReport() {
    if (loading) return <LoadingState message="Loading reports..." />
    if (error) return <ErrorState message={error.message} onRetry={refetch} />
    if (!rows || rows.length === 0) return <EmptyState message="No vehicles yet, so there is nothing to report." />

    // Derived during render: fleet totals for the chosen period
    const fleet = emptyTotals()
    rows.forEach(({ report }) => addTotals(fleet, report))
    if (fleet.total === 0) return <EmptyState message="No costs in this period." />

    return (
      <div className="space-y-6">
        <Card>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <StatTile label="Total" value={formatPeso(fleet.total)} />
            <StatTile label="Fuel" value={formatPeso(fleet.fuel)} />
            <StatTile label="Service" value={formatPeso(fleet.service)} />
            <StatTile label="Other" value={formatPeso(fleet.other)} />
          </div>
        </Card>
        <ByMonth rows={rows} />
        <ByVehicle rows={rows} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Reports" description="Fuel, service and other costs of the whole fleet, by month and by vehicle" />

      <Card>
        <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
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
      </Card>

      {renderReport()}
    </div>
  )
}

export default ReportsPage
