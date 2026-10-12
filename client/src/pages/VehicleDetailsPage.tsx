import { useCallback, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { toApiError } from '../api/axios'
import { deleteVehicle, getVehicle, updateVehicleStatus } from '../api/vehicles'
import Button from '../components/Button'
import ButtonLink from '../components/ButtonLink'
import Card from '../components/Card'
import ConfirmDialog from '../components/ConfirmDialog'
import EmptyState from '../components/EmptyState'
import ErrorState from '../components/ErrorState'
import LoadingState from '../components/LoadingState'
import PageHeader from '../components/PageHeader'
import VehicleStatusBadge from '../components/VehicleStatusBadge'
import CostsSection from '../components/vehicleDetails/CostsSection'
import FuelEfficiencySection from '../components/vehicleDetails/FuelEfficiencySection'
import HistorySection from '../components/vehicleDetails/HistorySection'
import ScheduleSection from '../components/vehicleDetails/ScheduleSection'
import { useApi } from '../hooks/useApi'
import { useToast } from '../hooks/useToast'
import type { VehicleStatus } from '../types/vehicle'
import { formatKm } from '../utils/format'
import { fuelTypeLabels, vehicleStatusLabels, vehicleTypeLabels } from '../utils/labels'

// D11: the status buttons shown for each current status. A retired vehicle has none.
const statusActions: Record<VehicleStatus, { status: VehicleStatus; label: string }[]> = {
  active: [
    { status: 'in_shop', label: 'Mark as in shop' },
    { status: 'retired', label: 'Retire' },
  ],
  in_shop: [
    { status: 'active', label: 'Mark as active' },
    { status: 'retired', label: 'Retire' },
  ],
  retired: [],
}

function VehicleDetailsPage() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const showToast = useToast()

  const loadVehicle = useCallback(() => getVehicle(id), [id])
  const vehicle = useApi(loadVehicle)

  const [confirmDelete, setConfirmDelete] = useState(false)
  const [confirmRetire, setConfirmRetire] = useState(false)
  const [busy, setBusy] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)

  async function changeStatus(status: VehicleStatus) {
    setBusy(true)
    setActionError(null)
    try {
      await updateVehicleStatus(id, status)
      showToast(`Status changed to ${vehicleStatusLabels[status]}`)
      vehicle.refetch()
    } catch (err) {
      setActionError(toApiError(err).message)
    } finally {
      setBusy(false)
      setConfirmRetire(false)
    }
  }

  async function handleDelete() {
    setBusy(true)
    setActionError(null)
    try {
      const result = await deleteVehicle(id)
      showToast(result.message) // says how many logs and expenses were removed too (D12)
      navigate('/vehicles')
    } catch (err) {
      setActionError(toApiError(err).message)
      setBusy(false)
      setConfirmDelete(false)
    }
  }

  if (vehicle.loading) return <LoadingState message="Loading vehicle..." />
  if (vehicle.error?.status === 404) {
    return (
      <EmptyState
        message="Vehicle not found. It may have been deleted."
        action={<ButtonLink to="/vehicles">Back to vehicles</ButtonLink>}
      />
    )
  }
  if (vehicle.error || !vehicle.data) {
    return <ErrorState message={vehicle.error?.message ?? 'Could not load the vehicle'} onRetry={vehicle.refetch} />
  }

  const data = vehicle.data

  return (
    <div className="space-y-6">
      <PageHeader
        title={data.plateNumber}
        description={`${data.make} ${data.model}${data.year ? ` ${data.year}` : ''} · ${vehicleTypeLabels[data.type]}`}
        action={
          <div className="flex gap-2">
            <ButtonLink to={`/vehicles/${id}/edit`} variant="secondary">
              Edit
            </ButtonLink>
            <Button variant="danger" onClick={() => setConfirmDelete(true)}>
              Delete
            </Button>
          </div>
        }
      />

      {actionError && <ErrorState title="That did not work" message={actionError} />}

      <Card title="Details">
        <dl className="grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <dt className="text-ink/60">Owner</dt>
            <dd className="font-medium">
              <Link to={`/owners/${data.owner._id}`} className="text-primary hover:underline">
                {data.owner.fullName}
              </Link>
            </dd>
          </div>
          <div>
            <dt className="text-ink/60">Current odometer</dt>
            <dd className="font-medium">{formatKm(data.currentOdometer)}</dd>
          </div>
          <div>
            <dt className="text-ink/60">Registration renewal</dt>
            <dd className="font-medium">Every {data.registrationMonth}</dd>
          </div>
          <div>
            <dt className="text-ink/60">Starting odometer</dt>
            <dd className="font-medium">{formatKm(data.startingOdometer)}</dd>
          </div>
          <div>
            <dt className="text-ink/60">Fuel type</dt>
            <dd className="font-medium">{data.fuelType ? fuelTypeLabels[data.fuelType] : 'Not specified'}</dd>
          </div>
          <div>
            <dt className="text-ink/60">Status</dt>
            <dd className="mt-1 flex flex-wrap items-center gap-2">
              <VehicleStatusBadge status={data.status} />
              {statusActions[data.status].map((action) => (
                <Button
                  key={action.status}
                  variant="secondary"
                  size="sm"
                  disabled={busy}
                  onClick={() => (action.status === 'retired' ? setConfirmRetire(true) : changeStatus(action.status))}
                >
                  {action.label}
                </Button>
              ))}
              {data.status === 'retired' && <span className="text-xs text-ink/60">A retired vehicle stays retired.</span>}
            </dd>
          </div>
        </dl>
      </Card>

      <ScheduleSection vehicleId={id} />
      <FuelEfficiencySection vehicleId={id} />
      <CostsSection vehicleId={id} />
      <HistorySection vehicleId={id} />

      <ConfirmDialog
        open={confirmDelete}
        title="Delete this vehicle?"
        message={`${data.plateNumber} will be deleted, and its service logs, fuel logs and expenses are removed too.`}
        deleting={busy}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(false)}
      />
      <ConfirmDialog
        open={confirmRetire}
        title="Retire this vehicle?"
        message={`${data.plateNumber} cannot go back to active, and new fuel and service logs will be refused.`}
        deleting={busy}
        confirmLabel="Retire"
        onConfirm={() => changeStatus('retired')}
        onCancel={() => setConfirmRetire(false)}
      />
    </div>
  )
}

export default VehicleDetailsPage
