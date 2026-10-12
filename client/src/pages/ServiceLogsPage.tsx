import { useCallback, useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { toApiError } from '../api/axios'
import { deleteServiceLog, getServiceLogs } from '../api/serviceLogs'
import { getServiceTypes } from '../api/serviceTypes'
import { getVehicles } from '../api/vehicles'
import Button from '../components/Button'
import ConfirmDialog from '../components/ConfirmDialog'
import EmptyState from '../components/EmptyState'
import ErrorState from '../components/ErrorState'
import LoadingState from '../components/LoadingState'
import PageHeader from '../components/PageHeader'
import Select from '../components/Select'
import ServiceLogForm from '../components/ServiceLogForm'
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
import type { ServiceLog } from '../types/serviceLog'
import { formatDate, formatKm, formatPeso } from '../utils/format'

function ServiceLogsPage() {
  // The vehicle filter lives in the URL (?vehicle=), so the vehicle details page can link here
  const [searchParams, setSearchParams] = useSearchParams()
  const vehicleFilter = searchParams.get('vehicle') ?? ''
  const showToast = useToast()

  const loadLogs = useCallback(() => getServiceLogs(vehicleFilter), [vehicleFilter])
  const { data: serviceLogs, loading, error, refetch } = useApi(loadLogs)
  const vehicles = useApi(getVehicles)
  const serviceTypes = useApi(getServiceTypes)

  const [formLog, setFormLog] = useState<ServiceLog | 'new' | null>(null)
  const [logToDelete, setLogToDelete] = useState<ServiceLog | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  function changeFilter(vehicleId: string) {
    setSearchParams(vehicleId ? { vehicle: vehicleId } : {})
  }

  function openForm(serviceLog: ServiceLog | 'new') {
    setFormLog(serviceLog)
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
      await deleteServiceLog(logToDelete._id)
      showToast('Service log deleted')
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
    if (vehicles.loading || serviceTypes.loading) return <LoadingState />
    if (vehicles.error) return <ErrorState message={vehicles.error.message} onRetry={vehicles.refetch} />
    if (serviceTypes.error) return <ErrorState message={serviceTypes.error.message} onRetry={serviceTypes.refetch} />
    return (
      <ServiceLogForm
        key={formLog === 'new' ? 'new' : formLog._id}
        serviceLog={formLog === 'new' ? undefined : formLog}
        vehicles={vehicles.data ?? []}
        serviceTypes={serviceTypes.data ?? []}
        defaultVehicleId={vehicleFilter}
        onSaved={handleSaved}
        onCancel={() => setFormLog(null)}
      />
    )
  }

  function renderLogs() {
    if (loading) return <LoadingState message="Loading service logs..." />
    if (error) return <ErrorState message={error.message} onRetry={refetch} />
    if (!serviceLogs || serviceLogs.length === 0) {
      return (
        <EmptyState
          message={vehicleFilter ? 'No services logged for this vehicle yet.' : 'No services logged yet.'}
          action={<Button onClick={() => openForm('new')}>Add service log</Button>}
        />
      )
    }

    // Derived during render: the total cost of the logs in the list
    const totalCost = serviceLogs.reduce((sum, log) => sum + (log.cost ?? 0), 0)

    const actions = (log: ServiceLog) => (
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
          {serviceLogs.length} service{serviceLogs.length === 1 ? '' : 's'} · total cost{' '}
          <span className="font-semibold text-ink">{formatPeso(totalCost)}</span>
        </p>

        <div className={tableWrapperClasses}>
          <table className={tableClasses}>
            <thead>
              <tr className={theadRowClasses}>
                <th className={thClasses}>Date</th>
                <th className={thClasses}>Vehicle</th>
                <th className={thClasses}>Service</th>
                <th className={`${thClasses} text-right`}>Odometer</th>
                <th className={`${thClasses} text-right`}>Cost</th>
                <th className={thClasses}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {serviceLogs.map((log) => (
                <tr key={log._id} className={rowClasses}>
                  <td className={`${tdClasses} whitespace-nowrap`}>{formatDate(log.date)}</td>
                  <td className={tdClasses}>
                    <Link to={`/vehicles/${log.vehicle._id}`} className={linkClasses}>
                      {log.vehicle.plateNumber}
                    </Link>
                  </td>
                  <td className={tdClasses}>
                    {log.serviceType.name}
                    {log.shop && <p className="text-xs text-ink/60">{log.shop}</p>}
                  </td>
                  <td className={`${tdClasses} text-right whitespace-nowrap`}>{formatKm(log.odometer)}</td>
                  <td className={`${tdClasses} text-right whitespace-nowrap`}>
                    {log.cost !== undefined ? formatPeso(log.cost) : '—'}
                  </td>
                  <td className={tdClasses}>{actions(log)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <ul className={cardListClasses}>
          {serviceLogs.map((log) => (
            <li key={log._id} className={cardItemClasses}>
              <div className="flex items-start justify-between gap-3">
                <p className="font-semibold">{log.serviceType.name}</p>
                <span className="text-sm font-semibold">{log.cost !== undefined ? formatPeso(log.cost) : '—'}</span>
              </div>
              <p className="mt-1 text-sm text-ink/70">
                {formatDate(log.date)} · {formatKm(log.odometer)}
              </p>
              <p className="text-sm text-ink/70">
                <Link to={`/vehicles/${log.vehicle._id}`} className={linkClasses}>
                  {log.vehicle.plateNumber}
                </Link>
                {log.shop && ` · ${log.shop}`}
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
        title="Service logs"
        description="Services done on each vehicle"
        action={<Button onClick={() => openForm('new')}>Add service log</Button>}
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
          onChange={(event) => changeFilter(event.target.value)}
        />
      </div>

      {renderForm()}

      {deleteError && <ErrorState title="Could not delete the service log" message={deleteError} />}

      {renderLogs()}

      <ConfirmDialog
        open={logToDelete !== null}
        title="Delete this service log?"
        message={
          logToDelete
            ? `${logToDelete.serviceType.name} on ${formatDate(logToDelete.date)} for ${logToDelete.vehicle.plateNumber} will be removed.`
            : ''
        }
        deleting={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setLogToDelete(null)}
      />
    </div>
  )
}

export default ServiceLogsPage
