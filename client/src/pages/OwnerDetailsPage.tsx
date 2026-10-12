import { useCallback, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { toApiError } from '../api/axios'
import { deleteOwner, getOwner } from '../api/owners'
import { getVehicles } from '../api/vehicles'
import Button from '../components/Button'
import ButtonLink from '../components/ButtonLink'
import Card from '../components/Card'
import ConfirmDialog from '../components/ConfirmDialog'
import EmptyState from '../components/EmptyState'
import ErrorState from '../components/ErrorState'
import LoadingState from '../components/LoadingState'
import OwnerForm from '../components/OwnerForm'
import PageHeader from '../components/PageHeader'
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
import { ownerTypeLabels, vehicleTypeLabels } from '../utils/labels'

function OwnerDetailsPage() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const showToast = useToast()

  // useCallback keeps the same request function until the id changes (see useApi)
  const loadOwner = useCallback(() => getOwner(id), [id])
  const loadVehicles = useCallback(() => getVehicles({ owner: id }), [id])
  const owner = useApi(loadOwner)
  const vehicles = useApi(loadVehicles)

  const [editing, setEditing] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  async function confirmDelete() {
    setDeleting(true)
    setDeleteError(null)
    try {
      await deleteOwner(id)
      showToast('Owner deleted')
      navigate('/owners')
    } catch (err) {
      // D12: 400 when the owner still has vehicles
      setDeleteError(toApiError(err).message)
      setDeleting(false)
      setConfirmOpen(false)
    }
  }

  if (owner.loading) return <LoadingState message="Loading owner..." />
  if (owner.error?.status === 404) {
    return (
      <EmptyState
        message="Owner not found. It may have been deleted."
        action={<ButtonLink to="/owners">Back to owners</ButtonLink>}
      />
    )
  }
  if (owner.error || !owner.data) {
    return <ErrorState message={owner.error?.message ?? 'Could not load the owner'} onRetry={owner.refetch} />
  }

  const data = owner.data

  function renderVehicles() {
    if (vehicles.loading) return <LoadingState message="Loading vehicles..." />
    if (vehicles.error) return <ErrorState message={vehicles.error.message} onRetry={vehicles.refetch} />
    if (!vehicles.data || vehicles.data.length === 0) {
      return (
        <EmptyState
          message="This owner has no vehicles yet."
          action={<ButtonLink to="/vehicles/new">Add vehicle</ButtonLink>}
        />
      )
    }

    return (
      <>
        <div className={tableWrapperClasses}>
          <table className={tableClasses}>
            <thead>
              <tr className={theadRowClasses}>
                <th className={thClasses}>Plate</th>
                <th className={thClasses}>Vehicle</th>
                <th className={thClasses}>Type</th>
                <th className={thClasses}>Status</th>
              </tr>
            </thead>
            <tbody>
              {vehicles.data.map((vehicle) => (
                <tr key={vehicle._id} className={rowClasses}>
                  <td className={tdClasses}>
                    <Link to={`/vehicles/${vehicle._id}`} className={linkClasses}>
                      {vehicle.plateNumber}
                    </Link>
                  </td>
                  <td className={tdClasses}>
                    {vehicle.make} {vehicle.model} {vehicle.year}
                  </td>
                  <td className={tdClasses}>{vehicleTypeLabels[vehicle.type]}</td>
                  <td className={tdClasses}>
                    <VehicleStatusBadge status={vehicle.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <ul className={cardListClasses}>
          {vehicles.data.map((vehicle) => (
            <li key={vehicle._id} className={`${cardItemClasses} flex items-start justify-between gap-3`}>
              <div>
                <Link to={`/vehicles/${vehicle._id}`} className={linkClasses}>
                  {vehicle.plateNumber}
                </Link>
                <p className="text-sm text-ink/70">
                  {vehicle.make} {vehicle.model} {vehicle.year} · {vehicleTypeLabels[vehicle.type]}
                </p>
              </div>
              <VehicleStatusBadge status={vehicle.status} />
            </li>
          ))}
        </ul>
      </>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={data.fullName}
        description={data.type ? ownerTypeLabels[data.type] : 'Owner'}
        action={
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => setEditing(true)}>
              Edit
            </Button>
            <Button variant="danger" onClick={() => setConfirmOpen(true)}>
              Delete
            </Button>
          </div>
        }
      />

      {deleteError && <ErrorState title="Could not delete the owner" message={deleteError} />}

      {editing ? (
        <OwnerForm
          owner={data}
          onSaved={() => {
            setEditing(false)
            owner.refetch()
          }}
          onCancel={() => setEditing(false)}
        />
      ) : (
        <Card title="Contact details">
          <dl className="grid gap-4 text-sm sm:grid-cols-3">
            <div>
              <dt className="text-ink/60">Contact number</dt>
              <dd className="font-medium">{data.contactNumber}</dd>
            </div>
            <div>
              <dt className="text-ink/60">Email</dt>
              <dd className="font-medium break-all">{data.email ?? 'No email'}</dd>
            </div>
            <div>
              <dt className="text-ink/60">Type</dt>
              <dd className="font-medium">{data.type ? ownerTypeLabels[data.type] : 'Not specified'}</dd>
            </div>
          </dl>
        </Card>
      )}

      <section>
        <h2 className="mb-4 text-lg font-semibold">Vehicles</h2>
        {renderVehicles()}
      </section>

      <ConfirmDialog
        open={confirmOpen}
        title="Delete this owner?"
        message={`${data.fullName} will be removed. Owners who still have vehicles cannot be deleted.`}
        deleting={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  )
}

export default OwnerDetailsPage
