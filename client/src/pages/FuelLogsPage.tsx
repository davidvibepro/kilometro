import { useCallback, useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { toApiError } from '../api/axios'
import { deleteFuelLog, getFuelLogs } from '../api/fuelLogs'
import { getFuelEfficiency, getVehicles } from '../api/vehicles'
import Button from '../components/Button'
import ConfirmDialog from '../components/ConfirmDialog'
import EmptyState from '../components/EmptyState'
import ErrorState from '../components/ErrorState'
import FuelLogForm from '../components/FuelLogForm'
import LoadingState from '../components/LoadingState'
import PageHeader from '../components/PageHeader'
import Select from '../components/Select'
import {
  cardItemClasses,
  cardListClasses,
  linkClasses,
  rowClasses,
  tableClasses,
  tableWrapperClasses,
  tdClasses,
  theadRowClasses,
  thClasses,
} from '../components/tableStyles'
import { useApi } from '../hooks/useApi'
import { useToast } from '../hooks/useToast'
import type { FuelLog } from '../types/fuelLog'
import type { FuelEfficiencyEntry } from '../types/reports'
import { formatDate, formatKm, formatKmPerLiter, formatLiters, formatPeso } from '../utils/format'

// Loads the fill-ups, then the D8 fuel efficiency of every vehicle in the list,
// so each full-tank fill-up can show its own km per liter
async function loadFillUps(vehicleId: string) {
  const fuelLogs = await getFuelLogs(vehicleId)
  const vehicleIds = [...new Set(fuelLogs.map((log) => log.vehicle._id))]
  const efficiencies = await Promise.all(vehicleIds.map((id) => getFuelEfficiency(id)))
  return { fuelLogs, entries: efficiencies.flatMap((efficiency) => efficiency.entries) }
}

function KmPerLiter({ entry }: { entry?: FuelEfficiencyEntry }) {
  // Partial fills and each vehicle's first full tank have no km per liter (D8)
  if (!entry) return <span className="text-ink/50">—</span>
  return (
    <span className={entry.flagged ? 'font-semibold text-overdue' : ''}>
      {formatKmPerLiter(entry.kmPerLiter)}
      {entry.flagged && <span className="block text-xs font-normal">15%+ below average</span>}
    </span>
  )
}

function FuelLogsPage() {
  // The vehicle filter lives in the URL (?vehicle=), so the vehicle details page can link here
  const [searchParams, setSearchParams] = useSearchParams()
  const vehicleFilter = searchParams.get('vehicle') ?? ''
  const showToast = useToast()

  const loadPage = useCallback(() => loadFillUps(vehicleFilter), [vehicleFilter])
  const { data, loading, error, refetch } = useApi(loadPage)
  const vehicles = useApi(getVehicles)

  const [formLog, setFormLog] = useState<FuelLog | 'new' | null>(null)
  const [logToDelete, setLogToDelete] = useState<FuelLog | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  function openForm(fuelLog: FuelLog | 'new') {
    setFormLog(fuelLog)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function handleSaved() {
    setFormLog(null)
    refetch()
  }

  async function confirmDelete() {
    if (!logToDelete) return
    setDeleting(true)
    setDeleteError(null)
    try {
      await deleteFuelLog(logToDelete._id)
      showToast('Fill-up deleted')
      refetch()
    } catch (err) {
      setDeleteError(toApiError(err).message)
    } finally {
      setDeleting(false)
      setLogToDelete(null)
    }
  }

  function renderForm() {
    if (!formLog) return null
    if (vehicles.loading) return <LoadingState />
    if (vehicles.error) return <ErrorState message={vehicles.error.message} onRetry={vehicles.refetch} />
    return (
      <FuelLogForm
        key={formLog === 'new' ? 'new' : formLog._id}
        fuelLog={formLog === 'new' ? undefined : formLog}
        vehicles={vehicles.data ?? []}
        defaultVehicleId={vehicleFilter}
        onSaved={handleSaved}
        onCancel={() => setFormLog(null)}
      />
    )
  }

  function renderFillUps() {
    if (loading) return <LoadingState message="Loading fill-ups..." />
    if (error) return <ErrorState message={error.message} onRetry={refetch} />
    if (!data || data.fuelLogs.length === 0) {
      return (
        <EmptyState
          message={vehicleFilter ? 'No fill-ups for this vehicle yet.' : 'No fill-ups yet.'}
          action={<Button onClick={() => openForm('new')}>Add fill-up</Button>}
        />
      )
    }

    // Derived during render: totals of the list, and each fill-up's km per liter by id
    const totalLiters = data.fuelLogs.reduce((sum, log) => sum + log.liters, 0)
    const totalCost = data.fuelLogs.reduce((sum, log) => sum + log.liters * log.pricePerLiter, 0)
    const entryById = new Map(data.entries.map((entry) => [entry.fuelLogId, entry]))

    const actions = (log: FuelLog) => (
      <div className="flex gap-2">
        <Button variant="secondary" size="sm" onClick={() => openForm(log)}>
          Edit
        </Button>
        <Button variant="danger" size="sm" onClick={() => setLogToDelete(log)}>
          Delete
        </Button>
      </div>
    )

    return (
      <>
        <p className="text-sm text-ink/70">
          {data.fuelLogs.length} fill-up{data.fuelLogs.length === 1 ? '' : 's'} · {formatLiters(totalLiters)} ·
          total cost <span className="font-semibold text-ink">{formatPeso(totalCost)}</span>
        </p>

        <div className={tableWrapperClasses}>
          <table className={tableClasses}>
            <thead>
              <tr className={theadRowClasses}>
                <th className={thClasses}>Date</th>
                <th className={thClasses}>Vehicle</th>
                <th className={`${thClasses} text-right`}>Odometer</th>
                <th className={`${thClasses} text-right`}>Liters</th>
                <th className={`${thClasses} text-right`}>Cost</th>
                <th className={`${thClasses} text-right`}>Km per liter</th>
                <th className={thClasses}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.fuelLogs.map((log) => (
                <tr key={log._id} className={rowClasses}>
                  <td className={`${tdClasses} whitespace-nowrap`}>{formatDate(log.date)}</td>
                  <td className={tdClasses}>
                    <Link to={`/vehicles/${log.vehicle._id}`} className={linkClasses}>
                      {log.vehicle.plateNumber}
                    </Link>
                  </td>
                  <td className={`${tdClasses} text-right whitespace-nowrap`}>{formatKm(log.odometer)}</td>
                  <td className={`${tdClasses} text-right whitespace-nowrap`}>
                    {formatLiters(log.liters)}
                    {!log.fullTank && <span className="block text-xs text-ink/60">partial</span>}
                  </td>
                  <td className={`${tdClasses} text-right whitespace-nowrap`}>
                    {formatPeso(log.liters * log.pricePerLiter)}
                    <span className="block text-xs text-ink/60">{formatPeso(log.pricePerLiter)}/L</span>
                  </td>
                  <td className={`${tdClasses} text-right whitespace-nowrap`}>
                    <KmPerLiter entry={entryById.get(log._id)} />
                  </td>
                  <td className={tdClasses}>{actions(log)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <ul className={cardListClasses}>
          {data.fuelLogs.map((log) => (
            <li key={log._id} className={cardItemClasses}>
              <div className="flex items-start justify-between gap-3">
                <Link to={`/vehicles/${log.vehicle._id}`} className={linkClasses}>
                  {log.vehicle.plateNumber}
                </Link>
                <span className="text-right text-sm">
                  <KmPerLiter entry={entryById.get(log._id)} />
                </span>
              </div>
              <p className="mt-1 text-sm text-ink/70">
                {formatDate(log.date)} · {formatKm(log.odometer)}
              </p>
              <p className="text-sm">
                {formatLiters(log.liters)}
                {!log.fullTank && ' (partial)'} × {formatPeso(log.pricePerLiter)} ={' '}
                <span className="font-semibold">{formatPeso(log.liters * log.pricePerLiter)}</span>
              </p>
              <div className="mt-3">{actions(log)}</div>
            </li>
          ))}
        </ul>
      </>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Fuel logs"
        description="Fill-ups, with the km per liter of each full tank"
        action={<Button onClick={() => openForm('new')}>Add fill-up</Button>}
      />

      <div className="max-w-sm">
        <Select
          label="Vehicle"
          placeholder="All vehicles"
          options={(vehicles.data ?? []).map((vehicle) => ({
            value: vehicle._id,
            label: `${vehicle.plateNumber} · ${vehicle.make} ${vehicle.model}`,
          }))}
          value={vehicleFilter}
          onChange={(event) => setSearchParams(event.target.value ? { vehicle: event.target.value } : {})}
        />
      </div>

      {renderForm()}

      {deleteError && <ErrorState title="Could not delete the fill-up" message={deleteError} />}

      {renderFillUps()}

      <ConfirmDialog
        open={logToDelete !== null}
        title="Delete this fill-up?"
        message={
          logToDelete
            ? `The fill-up on ${formatDate(logToDelete.date)} for ${logToDelete.vehicle.plateNumber} will be removed.`
            : ''
        }
        deleting={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setLogToDelete(null)}
      />
    </div>
  )
}

export default FuelLogsPage
