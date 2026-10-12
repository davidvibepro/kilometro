import { useState } from 'react'
import { toApiError } from '../api/axios'
import { deleteServiceType, getServiceTypes } from '../api/serviceTypes'
import Button from '../components/Button'
import ConfirmDialog from '../components/ConfirmDialog'
import EmptyState from '../components/EmptyState'
import ErrorState from '../components/ErrorState'
import LoadingState from '../components/LoadingState'
import PageHeader from '../components/PageHeader'
import ServiceTypeForm from '../components/ServiceTypeForm'
import {
  cardItemClasses,
  cardListClasses,
  rowClasses,
  tableClasses,
  tableWrapperClasses,
  tdClasses,
  theadRowClasses,
  thClasses,
} from '../components/tableStyles'
import { useApi } from '../hooks/useApi'
import { useToast } from '../hooks/useToast'
import type { ServiceType } from '../types/serviceType'
import { formatKm } from '../utils/format'
import { vehicleTypeLabels } from '../utils/labels'

// "5,000 km or 6 months": the limits this service type has
function intervalText(serviceType: ServiceType) {
  const limits: string[] = []
  if (serviceType.intervalKm) limits.push(formatKm(serviceType.intervalKm))
  if (serviceType.intervalMonths) {
    limits.push(`${serviceType.intervalMonths} month${serviceType.intervalMonths === 1 ? '' : 's'}`)
  }
  return limits.join(' or ')
}

function appliesToText(serviceType: ServiceType) {
  if (serviceType.appliesTo.length === 0) return 'No vehicle types'
  return serviceType.appliesTo.map((type) => vehicleTypeLabels[type]).join(', ')
}

function ServiceTypesPage() {
  const { data: serviceTypes, loading, error, refetch } = useApi(getServiceTypes)
  const showToast = useToast()

  const [formType, setFormType] = useState<ServiceType | 'new' | null>(null)
  const [typeToDelete, setTypeToDelete] = useState<ServiceType | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  function openForm(serviceType: ServiceType | 'new') {
    setFormType(serviceType)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function handleSaved() {
    setFormType(null)
    refetch()
  }

  async function confirmDelete() {
    if (!typeToDelete) return
    setDeleting(true)
    setDeleteError(null)
    try {
      await deleteServiceType(typeToDelete._id)
      showToast('Service type deleted')
      refetch()
    } catch (err) {
      // D12: 400 when service logs still use this type
      setDeleteError(toApiError(err).message)
    } finally {
      setDeleting(false)
      setTypeToDelete(null)
    }
  }

  function renderServiceTypes() {
    if (loading) return <LoadingState message="Loading service types..." />
    if (error) return <ErrorState message={error.message} onRetry={refetch} />
    if (!serviceTypes || serviceTypes.length === 0) {
      return (
        <EmptyState
          message="No service types yet."
          action={<Button onClick={() => openForm('new')}>Add service type</Button>}
        />
      )
    }

    const actions = (serviceType: ServiceType) => (
      <div className="flex gap-2">
        <Button variant="secondary" size="sm" onClick={() => openForm(serviceType)}>
          Edit
        </Button>
        <Button variant="danger" size="sm" onClick={() => setTypeToDelete(serviceType)}>
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
                <th className={thClasses}>Service</th>
                <th className={thClasses}>Due every</th>
                <th className={thClasses}>Applies to</th>
                <th className={thClasses}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {serviceTypes.map((serviceType) => (
                <tr key={serviceType._id} className={rowClasses}>
                  <td className={`${tdClasses} font-medium`}>{serviceType.name}</td>
                  <td className={tdClasses}>{intervalText(serviceType)}</td>
                  <td className={tdClasses}>{appliesToText(serviceType)}</td>
                  <td className={tdClasses}>{actions(serviceType)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <ul className={cardListClasses}>
          {serviceTypes.map((serviceType) => (
            <li key={serviceType._id} className={cardItemClasses}>
              <p className="font-semibold">{serviceType.name}</p>
              <p className="mt-1 text-sm">Every {intervalText(serviceType)}</p>
              <p className="text-sm text-ink/70">{appliesToText(serviceType)}</p>
              <div className="mt-3">{actions(serviceType)}</div>
            </li>
          ))}
        </ul>
      </>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Service types"
        description="Kinds of maintenance and how often they are needed"
        action={<Button onClick={() => openForm('new')}>Add service type</Button>}
      />

      {formType && (
        <ServiceTypeForm
          key={formType === 'new' ? 'new' : formType._id}
          serviceType={formType === 'new' ? undefined : formType}
          onSaved={handleSaved}
          onCancel={() => setFormType(null)}
        />
      )}

      {deleteError && <ErrorState title="Could not delete the service type" message={deleteError} />}

      {renderServiceTypes()}

      <ConfirmDialog
        open={typeToDelete !== null}
        title="Delete this service type?"
        message={`${typeToDelete?.name ?? 'This service type'} will be removed. Service types that are used by service logs cannot be deleted.`}
        deleting={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setTypeToDelete(null)}
      />
    </div>
  )
}

export default ServiceTypesPage
