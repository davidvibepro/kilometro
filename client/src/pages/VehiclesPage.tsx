import { useCallback, useState } from 'react'
import { Link } from 'react-router'
import { toApiError } from '../api/axios'
import { deleteVehicle, getVehicles } from '../api/vehicles'
import Button from '../components/Button'
import ButtonLink from '../components/ButtonLink'
import ConfirmDialog from '../components/ConfirmDialog'
import EmptyState from '../components/EmptyState'
import ErrorState from '../components/ErrorState'
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
import VehicleStatusBadge from '../components/VehicleStatusBadge'
import { useApi } from '../hooks/useApi'
import { useToast } from '../hooks/useToast'
import type { VehicleListItem, VehicleStatus, VehicleType } from '../types/vehicle'
import { vehicleStatusLabels, vehicleTypeLabels } from '../utils/labels'

// Options for the two filters, built from the label maps
const typeOptions = Object.entries(vehicleTypeLabels).map(([value, label]) => ({ value, label }))
const statusOptions = Object.entries(vehicleStatusLabels).map(([value, label]) => ({ value, label }))

function VehiclesPage() {
  const [type, setType] = useState<VehicleType | ''>('')
  const [status, setStatus] = useState<VehicleStatus | ''>('')
  const showToast = useToast()

  // A new request function only when a filter changes, so useApi loads again (D17)
  const loadVehicles = useCallback(() => getVehicles({ type, status }), [type, status])
  const { data: vehicles, loading, error, refetch } = useApi(loadVehicles)

  const [vehicleToDelete, setVehicleToDelete] = useState<VehicleListItem | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const hasFilters = type !== '' || status !== ''

  async function confirmDelete() {
    if (!vehicleToDelete) return
    setDeleting(true)
    setDeleteError(null)
    try {
      const result = await deleteVehicle(vehicleToDelete._id)
      showToast(result.message) // says how many logs and expenses were removed too
      refetch()
    } catch (err) {
      setDeleteError(toApiError(err).message)
    } finally {
      setDeleting(false)
      setVehicleToDelete(null)
    }
  }

  function renderVehicles() {
    if (loading) return <LoadingState message="Loading vehicles..." />
    if (error) return <ErrorState message={error.message} onRetry={refetch} />
    if (!vehicles || vehicles.length === 0) {
      return hasFilters ? (
        <EmptyState
          message="No vehicles match these filters."
          action={
            <Button
              variant="secondary"
              onClick={() => {
                setType('')
                setStatus('')
              }}
            >
              Clear filters
            </Button>
          }
        />
      ) : (
        <EmptyState message="No vehicles yet." action={<ButtonLink to="/vehicles/new">Add vehicle</ButtonLink>} />
      )
    }

    const actions = (vehicle: VehicleListItem) => (
      <div className="flex gap-2">
        <ButtonLink to={`/vehicles/${vehicle._id}/edit`} variant="secondary" size="sm">
          Edit
        </ButtonLink>
        <Button variant="danger" size="sm" onClick={() => setVehicleToDelete(vehicle)}>
          Delete
        </Button>
      </div>
    )

    return (
      <>
        <div className={tableWrapperClasses}>
          <table className={tableClasses}>
            <thead>
              <tr className={theadRowClasses}>
                <th className={thClasses}>Plate</th>
                <th className={thClasses}>Vehicle</th>
                <th className={thClasses}>Owner</th>
                <th className={thClasses}>Status</th>
                <th className={thClasses}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {vehicles.map((vehicle) => (
                <tr key={vehicle._id} className={rowClasses}>
                  <td className={tdClasses}>
                    <Link to={`/vehicles/${vehicle._id}`} className={linkClasses}>
                      {vehicle.plateNumber}
                    </Link>
                  </td>
                  <td className={tdClasses}>
                    {vehicle.make} {vehicle.model} {vehicle.year}
                    <p className="text-xs text-ink/60">{vehicleTypeLabels[vehicle.type]}</p>
                  </td>
                  <td className={tdClasses}>
                    <Link to={`/owners/${vehicle.owner._id}`} className="hover:underline">
                      {vehicle.owner.fullName}
                    </Link>
                  </td>
                  <td className={tdClasses}>
                    <VehicleStatusBadge status={vehicle.status} />
                  </td>
                  <td className={tdClasses}>{actions(vehicle)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <ul className={cardListClasses}>
          {vehicles.map((vehicle) => (
            <li key={vehicle._id} className={cardItemClasses}>
              <div className="flex items-start justify-between gap-3">
                <Link to={`/vehicles/${vehicle._id}`} className={linkClasses}>
                  {vehicle.plateNumber}
                </Link>
                <VehicleStatusBadge status={vehicle.status} />
              </div>
              <p className="mt-1 text-sm text-ink/70">
                {vehicle.make} {vehicle.model} {vehicle.year} · {vehicleTypeLabels[vehicle.type]}
              </p>
              <p className="text-sm text-ink/70">Owner: {vehicle.owner.fullName}</p>
              <div className="mt-3">{actions(vehicle)}</div>
            </li>
          ))}
        </ul>
      </>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Vehicles"
        description="Cars and motorcycles, with their owners and status"
        action={<ButtonLink to="/vehicles/new">Add vehicle</ButtonLink>}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:max-w-xl">
        <Select
          label="Type"
          placeholder="All types"
          options={typeOptions}
          value={type}
          onChange={(event) => setType(event.target.value as VehicleType | '')}
        />
        <Select
          label="Status"
          placeholder="All statuses"
          options={statusOptions}
          value={status}
          onChange={(event) => setStatus(event.target.value as VehicleStatus | '')}
        />
      </div>

      {deleteError && <ErrorState title="Could not delete the vehicle" message={deleteError} />}

      {renderVehicles()}

      <ConfirmDialog
        open={vehicleToDelete !== null}
        title="Delete this vehicle?"
        message={`${vehicleToDelete?.plateNumber ?? 'This vehicle'} will be deleted, and its service logs, fuel logs and expenses are removed too.`}
        deleting={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setVehicleToDelete(null)}
      />
    </div>
  )
}

export default VehiclesPage
