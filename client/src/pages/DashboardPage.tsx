import { Link } from 'react-router'
import { getReminders } from '../api/reminders'
import { getFleetStats } from '../api/stats'
import ButtonLink from '../components/ButtonLink'
import Card from '../components/Card'
import EmptyState from '../components/EmptyState'
import ErrorState from '../components/ErrorState'
import LoadingState from '../components/LoadingState'
import PageHeader from '../components/PageHeader'
import StatTile from '../components/StatTile'
import { linkClasses } from '../components/tableStyles'
import { useApi } from '../hooks/useApi'
import type { CostTotals, FleetStats, ServiceReminder } from '../types/reports'
import { formatKm, formatPeso, formatRemaining } from '../utils/format'

const OVERDUE_SHOWN = 5

// Derived during render: a part's share of a total, in whole percent
function percentOf(part: number, total: number) {
  return total > 0 ? Math.round((part / total) * 100) : 0
}

function SpendingCard({ spending }: { spending: CostTotals }) {
  const monthName = new Date().toLocaleDateString('en-PH', { month: 'long', year: 'numeric' })
  const parts = [
    { label: 'Fuel', amount: spending.fuel, color: 'bg-primary' },
    { label: 'Service', amount: spending.service, color: 'bg-ink' },
    { label: 'Other expenses', amount: spending.other, color: 'bg-ink/40' },
  ]

  return (
    <Card title={`Spending in ${monthName}`}>
      <p className="text-3xl font-bold">{formatPeso(spending.total)}</p>
      <ul className="mt-4 space-y-3">
        {parts.map((part) => (
          <li key={part.label}>
            <div className="flex justify-between text-sm">
              <span>{part.label}</span>
              <span className="font-medium">
                {formatPeso(part.amount)} · {percentOf(part.amount, spending.total)}%
              </span>
            </div>
            <div className="mt-1 h-2 rounded-full bg-surface">
              <div
                className={`h-2 rounded-full ${part.color}`}
                style={{ width: `${percentOf(part.amount, spending.total)}%` }}
              />
            </div>
          </li>
        ))}
      </ul>
    </Card>
  )
}

function OverdueCard() {
  const { data: reminders, loading, error, refetch } = useApi(getReminders)

  function renderOverdue() {
    if (loading) return <LoadingState />
    if (error) return <ErrorState message={error.message} onRetry={refetch} />

    // Derived during render: only the overdue services (already most overdue first)
    const overdue = (reminders ?? []).filter(
      (item): item is ServiceReminder => item.kind === 'service' && item.status === 'overdue'
    )
    if (overdue.length === 0) return <p className="text-sm text-ink/70">No overdue services.</p>

    return (
      <ul className="divide-y divide-ink/10">
        {overdue.slice(0, OVERDUE_SHOWN).map((item) => (
          <li key={`${item.vehicle._id}-${item.serviceType._id}`} className="py-2 text-sm">
            <div className="flex justify-between gap-3">
              <span className="font-medium">{item.serviceType.name}</span>
              <Link to={`/vehicles/${item.vehicle._id}`} className={linkClasses}>
                {item.vehicle.plateNumber}
              </Link>
            </div>
            <p className="text-overdue">{formatRemaining(item.kmRemaining, item.daysRemaining)}</p>
          </li>
        ))}
      </ul>
    )
  }

  return (
    <Card>
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">Overdue services</h2>
        <ButtonLink to="/reminders" variant="secondary" size="sm">
          All reminders
        </ButtonLink>
      </div>
      {renderOverdue()}
    </Card>
  )
}

function RankingCard({ ranking }: { ranking: FleetStats['ranking'] }) {
  if (ranking.length === 0) {
    return (
      <Card title="Cost per km ranking">
        <p className="text-sm text-ink/70">No vehicle has driven any distance yet.</p>
      </Card>
    )
  }

  // Derived during render: each bar is relative to the most expensive vehicle (the first one)
  const highest = ranking[0].costPerKm

  return (
    <Card title="Cost per km ranking">
      <p className="-mt-2 mb-4 text-sm text-ink/70">All-time cost divided by distance driven, highest first</p>
      <ol className="space-y-4">
        {ranking.map((row, index) => (
          <li key={row.vehicle._id}>
            <div className="flex flex-wrap items-baseline justify-between gap-x-3 text-sm">
              <span>
                <span className="mr-2 text-ink/50">{index + 1}.</span>
                <Link to={`/vehicles/${row.vehicle._id}`} className={linkClasses}>
                  {row.vehicle.plateNumber}
                </Link>{' '}
                <span className="text-ink/70">
                  {row.vehicle.make} {row.vehicle.model}
                </span>
              </span>
              <span className="font-semibold">{formatPeso(row.costPerKm)} / km</span>
            </div>
            <div className="mt-1 h-2 rounded-full bg-surface">
              <div
                className="h-2 rounded-full bg-primary"
                style={{ width: `${percentOf(row.costPerKm, highest)}%` }}
              />
            </div>
            <p className="mt-1 text-xs text-ink/60">
              {formatPeso(row.totalCost)} over {formatKm(row.distance)}
            </p>
          </li>
        ))}
      </ol>
    </Card>
  )
}

function DashboardPage() {
  const { data: stats, loading, error, refetch } = useApi(getFleetStats)

  function renderDashboard() {
    if (loading) return <LoadingState message="Loading the dashboard..." />
    if (error) return <ErrorState message={error.message} onRetry={refetch} />
    if (!stats) return <EmptyState message="No data yet." />

    return (
      <div className="space-y-6">
        <Card>
          <div className="grid gap-3 sm:grid-cols-3">
            <StatTile label="Spent this month" value={formatPeso(stats.spendingThisMonth.total)} />
            <StatTile
              label="Vehicles with overdue services"
              value={String(stats.overdueVehicles)}
              hint="Active vehicles only"
            />
            <StatTile
              label="Most common service"
              value={stats.mostCommonService?.serviceType.name ?? '—'}
              hint={stats.mostCommonService ? `${stats.mostCommonService.count} service logs` : 'No services logged yet'}
            />
          </div>
        </Card>

        <div className="grid gap-6 lg:grid-cols-2">
          <SpendingCard spending={stats.spendingThisMonth} />
          <OverdueCard />
        </div>

        <RankingCard ranking={stats.ranking} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Spending this month, overdue services and which vehicles cost the most to run"
      />
      {renderDashboard()}
    </div>
  )
}

export default DashboardPage
