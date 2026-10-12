import { useState } from 'react'
import { Link } from 'react-router'
import { toApiError } from '../api/axios'
import { deleteOwner, getOwners } from '../api/owners'
import { getVehicles } from '../api/vehicles'
import Button from '../components/Button'
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
import { useApi } from '../hooks/useApi'
import { useToast } from '../hooks/useToast'
import type { Owner } from '../types/owner'
import { ownerTypeLabels } from '../utils/labels'

function OwnersPage() {
  const { data: owners, loading, error, refetch } = useApi(getOwners)
  const { data: vehicles } = useApi(getVehicles)
  const showToast = useToast()

  const [formOwner, setFormOwner] = useState<Owner | 'new' | null>(null)
  const [ownerToDelete, setOwnerToDelete] = useState<Owner | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  // Derived during render: how many vehicles an owner has ("…" while vehicles load)
  function vehicleCount(ownerId: string) {
    return vehicles ? vehicles.filter((vehicle) => vehicle.owner._id === ownerId).length : '…'
  }

  function openForm(owner: Owner | 'new') {
    setFormOwner(owner)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function handleSaved() {
    setFormOwner(null)
    refetch()
  }

  async function confirmDelete() {
    if (!ownerToDelete) return
    setDeleting(true)
    setDeleteError(null)
    try {
      await deleteOwner(ownerToDelete._id)
      showToast('Owner deleted')
      refetch()
    } catch (err) {
      // D12: 400 when the owner still has vehicles
      setDeleteError(toApiError(err).message)
    } finally {
      setDeleting(false)
      setOwnerToDelete(null)
    }
  }

  function renderOwners() {
    if (loading) return <LoadingState message="Loading owners..." />
    if (error) return <ErrorState message={error.message} onRetry={refetch} />
    if (!owners || owners.length === 0) {
      return <EmptyState message="No owners yet." action={<Button onClick={() => openForm('new')}>Add owner</Button>} />
    }

    const actions = (owner: Owner) => (
      <div className="flex gap-2">
        <Button variant="secondary" size="sm" onClick={() => openForm(owner)}>
          Edit
        </Button>
        <Button variant="danger" size="sm" onClick={() => setOwnerToDelete(owner)}>
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
                <th className={thClasses}>Name</th>
                <th className={thClasses}>Type</th>
                <th className={thClasses}>Contact number</th>
                <th className={thClasses}>Vehicles</th>
                <th className={thClasses}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {owners.map((owner) => (
                <tr key={owner._id} className={rowClasses}>
                  <td className={tdClasses}>
                    <Link to={`/owners/${owner._id}`} className={linkClasses}>
                      {owner.fullName}
                    </Link>
                    {owner.email && <p className="text-xs text-ink/60">{owner.email}</p>}
                  </td>
                  <td className={tdClasses}>{owner.type ? ownerTypeLabels[owner.type] : '—'}</td>
                  <td className={tdClasses}>{owner.contactNumber}</td>
                  <td className={tdClasses}>{vehicleCount(owner._id)}</td>
                  <td className={tdClasses}>{actions(owner)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <ul className={cardListClasses}>
          {owners.map((owner) => (
            <li key={owner._id} className={cardItemClasses}>
              <Link to={`/owners/${owner._id}`} className={linkClasses}>
                {owner.fullName}
              </Link>
              <p className="mt-1 text-sm text-ink/70">
                {owner.type ? ownerTypeLabels[owner.type] : 'Type not specified'} · {owner.contactNumber}
              </p>
              {owner.email && <p className="text-sm break-all text-ink/70">{owner.email}</p>}
              <p className="mt-1 text-sm">Vehicles: {vehicleCount(owner._id)}</p>
              <div className="mt-3">{actions(owner)}</div>
            </li>
          ))}
        </ul>
      </>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Owners"
        description="People and businesses that own vehicles"
        action={<Button onClick={() => openForm('new')}>Add owner</Button>}
      />

      {formOwner && (
        <OwnerForm
          key={formOwner === 'new' ? 'new' : formOwner._id}
          owner={formOwner === 'new' ? undefined : formOwner}
          onSaved={handleSaved}
          onCancel={() => setFormOwner(null)}
        />
      )}

      {deleteError && <ErrorState title="Could not delete the owner" message={deleteError} />}

      {renderOwners()}

      <ConfirmDialog
        open={ownerToDelete !== null}
        title="Delete this owner?"
        message={`${ownerToDelete?.fullName ?? 'This owner'} will be removed. Owners who still have vehicles cannot be deleted.`}
        deleting={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setOwnerToDelete(null)}
      />
    </div>
  )
}

export default OwnersPage
