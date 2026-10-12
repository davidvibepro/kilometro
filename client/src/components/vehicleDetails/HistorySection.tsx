import { useCallback, type ReactNode } from 'react'
import { getExpenses } from '../../api/expenses'
import { getFuelLogs } from '../../api/fuelLogs'
import { getServiceLogs } from '../../api/serviceLogs'
import { useApi } from '../../hooks/useApi'
import { formatDate, formatKm, formatLiters, formatPeso } from '../../utils/format'
import { expenseCategoryLabels } from '../../utils/labels'
import ButtonLink from '../ButtonLink'
import Card from '../Card'
import ErrorState from '../ErrorState'
import LoadingState from '../LoadingState'

const RECENT_COUNT = 5

interface HistoryListProps<T> {
  title: string
  seeAllTo: string
  emptyMessage: string
  state: { data: T[] | null; loading: boolean; error: { message: string } | null; refetch: () => void }
  renderRow: (item: T) => ReactNode
  getKey: (item: T) => string
}

// One short list (newest first) with a link to the full page
function HistoryList<T>({ title, seeAllTo, emptyMessage, state, renderRow, getKey }: HistoryListProps<T>) {
  function renderItems() {
    if (state.loading) return <LoadingState />
    if (state.error) return <ErrorState message={state.error.message} onRetry={state.refetch} />
    if (!state.data || state.data.length === 0) return <p className="text-sm text-ink/70">{emptyMessage}</p>
    return (
      <ul className="divide-y divide-ink/10">
        {state.data.slice(0, RECENT_COUNT).map((item) => (
          <li key={getKey(item)} className="py-2 text-sm">
            {renderRow(item)}
          </li>
        ))}
      </ul>
    )
  }

  return (
    <Card>
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="font-semibold">{title}</h3>
        <ButtonLink to={seeAllTo} variant="secondary" size="sm">
          See all
        </ButtonLink>
      </div>
      {renderItems()}
    </Card>
  )
}

interface HistorySectionProps {
  vehicleId: string
}

// The latest service logs, fill-ups and expenses of this vehicle
function HistorySection({ vehicleId }: HistorySectionProps) {
  const loadServiceLogs = useCallback(() => getServiceLogs(vehicleId), [vehicleId])
  const loadFuelLogs = useCallback(() => getFuelLogs(vehicleId), [vehicleId])
  const loadExpenses = useCallback(() => getExpenses(vehicleId), [vehicleId])
  const serviceLogs = useApi(loadServiceLogs)
  const fuelLogs = useApi(loadFuelLogs)
  const expenses = useApi(loadExpenses)

  return (
    <section>
      <h2 className="mb-4 text-lg font-semibold">History</h2>
      <div className="grid gap-4 lg:grid-cols-3">
        <HistoryList
          title="Services"
          seeAllTo={`/service-logs?vehicle=${vehicleId}`}
          emptyMessage="No services logged yet."
          state={serviceLogs}
          getKey={(log) => log._id}
          renderRow={(log) => (
            <div className="flex justify-between gap-3">
              <div>
                <p className="font-medium">{log.serviceType.name}</p>
                <p className="text-ink/60">
                  {formatDate(log.date)} · {formatKm(log.odometer)}
                </p>
              </div>
              <span>{log.cost !== undefined ? formatPeso(log.cost) : '—'}</span>
            </div>
          )}
        />
        <HistoryList
          title="Fill-ups"
          seeAllTo={`/fuel-logs?vehicle=${vehicleId}`}
          emptyMessage="No fill-ups logged yet."
          state={fuelLogs}
          getKey={(log) => log._id}
          renderRow={(log) => (
            <div className="flex justify-between gap-3">
              <div>
                <p className="font-medium">
                  {formatLiters(log.liters)}
                  {!log.fullTank && <span className="ml-2 text-xs text-ink/60">(partial)</span>}
                </p>
                <p className="text-ink/60">
                  {formatDate(log.date)} · {formatKm(log.odometer)}
                </p>
              </div>
              {/* Derived during render: liters x price per liter */}
              <span>{formatPeso(log.liters * log.pricePerLiter)}</span>
            </div>
          )}
        />
        <HistoryList
          title="Expenses"
          seeAllTo={`/expenses?vehicle=${vehicleId}`}
          emptyMessage="No expenses logged yet."
          state={expenses}
          getKey={(expense) => expense._id}
          renderRow={(expense) => (
            <div className="flex justify-between gap-3">
              <div>
                <p className="font-medium">{expenseCategoryLabels[expense.category]}</p>
                <p className="text-ink/60">{formatDate(expense.date)}</p>
              </div>
              <span>{formatPeso(expense.amount)}</span>
            </div>
          )}
        />
      </div>
    </section>
  )
}

export default HistorySection
