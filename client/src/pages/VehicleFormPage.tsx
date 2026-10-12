import { zodResolver } from '@hookform/resolvers/zod'
import { useCallback, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate, useParams, useSearchParams } from 'react-router'
import { toApiError } from '../api/axios'
import { getOwners } from '../api/owners'
import { createVehicle, getVehicle, updateVehicle } from '../api/vehicles'
import Button from '../components/Button'
import ButtonLink from '../components/ButtonLink'
import Card from '../components/Card'
import EmptyState from '../components/EmptyState'
import ErrorState from '../components/ErrorState'
import Input from '../components/Input'
import LoadingState from '../components/LoadingState'
import PageHeader from '../components/PageHeader'
import Select from '../components/Select'
import { useApi } from '../hooks/useApi'
import { useToast } from '../hooks/useToast'
import { toVehiclePayload, vehicleSchema, type VehicleFormValues } from '../schemas/vehicleSchema'
import type { Owner } from '../types/owner'
import type { VehicleDetails } from '../types/vehicle'
import { fuelTypeLabels, vehicleTypeLabels } from '../utils/labels'

const typeOptions = Object.entries(vehicleTypeLabels).map(([value, label]) => ({ value, label }))
const fuelOptions = Object.entries(fuelTypeLabels).map(([value, label]) => ({ value, label }))

interface VehicleFormProps {
  vehicle: VehicleDetails | null // null = add a new vehicle
  owners: Owner[]
  defaultOwnerId: string
}

// The form itself. It is only shown once the owners (and the vehicle, when editing)
// have loaded, because React Hook Form reads defaultValues only once.
function VehicleForm({ vehicle, owners, defaultOwnerId }: VehicleFormProps) {
  const navigate = useNavigate()
  const showToast = useToast()
  const [serverError, setServerError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<VehicleFormValues>({
    resolver: zodResolver(vehicleSchema),
    defaultValues: {
      owner: vehicle?.owner._id ?? defaultOwnerId,
      plateNumber: vehicle?.plateNumber ?? '',
      make: vehicle?.make ?? '',
      model: vehicle?.model ?? '',
      year: vehicle?.year?.toString() ?? '',
      type: vehicle?.type,
      fuelType: vehicle?.fuelType ?? '',
      startingOdometer: vehicle?.startingOdometer.toString() ?? '',
    },
  })

  async function onSubmit(values: VehicleFormValues) {
    setServerError(null)
    try {
      const payload = toVehiclePayload(values)
      const saved = vehicle ? await updateVehicle(vehicle._id, payload) : await createVehicle(payload)
      showToast(vehicle ? 'Vehicle updated' : 'Vehicle added')
      navigate(`/vehicles/${saved._id}`)
    } catch (error) {
      // e.g. 400 "plateNumber already exists" from the server
      setServerError(toApiError(error).message)
    }
  }

  return (
    <Card>
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        {serverError && <ErrorState title="Could not save the vehicle" message={serverError} />}
        <div className="grid gap-4 md:grid-cols-2">
          <Select
            label="Owner"
            placeholder="Choose an owner"
            options={owners.map((owner) => ({ value: owner._id, label: owner.fullName }))}
            error={errors.owner?.message}
            {...register('owner')}
          />
          <Input
            label="Plate number"
            placeholder="ABC 1234"
            error={errors.plateNumber?.message}
            {...register('plateNumber')}
          />
          <Input label="Make" placeholder="Toyota" error={errors.make?.message} {...register('make')} />
          <Input label="Model" placeholder="Vios" error={errors.model?.message} {...register('model')} />
          <Select
            label="Type"
            placeholder="Choose a type"
            options={typeOptions}
            error={errors.type?.message}
            {...register('type')}
          />
          <Select
            label="Fuel type (optional)"
            placeholder="Not specified"
            options={fuelOptions}
            error={errors.fuelType?.message}
            {...register('fuelType')}
          />
          <Input
            label="Year (optional)"
            type="number"
            inputMode="numeric"
            error={errors.year?.message}
            {...register('year')}
          />
          <Input
            label="Starting odometer (km)"
            type="number"
            inputMode="numeric"
            min={0}
            error={errors.startingOdometer?.message}
            {...register('startingOdometer')}
          />
        </div>
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <ButtonLink to={vehicle ? `/vehicles/${vehicle._id}` : '/vehicles'} variant="secondary">
            Cancel
          </ButtonLink>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save vehicle'}
          </Button>
        </div>
      </form>
    </Card>
  )
}

// /vehicles/new and /vehicles/:id/edit
function VehicleFormPage() {
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const isEdit = id !== undefined

  const owners = useApi(getOwners)
  // When adding there is no vehicle to load, so the request answers null at once
  const loadVehicle = useCallback(async () => (id ? getVehicle(id) : null), [id])
  const vehicle = useApi(loadVehicle)

  function renderForm() {
    if (owners.loading || vehicle.loading) return <LoadingState />
    if (vehicle.error?.status === 404) {
      return (
        <EmptyState message="Vehicle not found." action={<ButtonLink to="/vehicles">Back to vehicles</ButtonLink>} />
      )
    }
    if (vehicle.error) return <ErrorState message={vehicle.error.message} onRetry={vehicle.refetch} />
    if (owners.error) return <ErrorState message={owners.error.message} onRetry={owners.refetch} />
    if (!owners.data || owners.data.length === 0) {
      return (
        <EmptyState
          message="Add an owner first: every vehicle needs one."
          action={<ButtonLink to="/owners">Go to owners</ButtonLink>}
        />
      )
    }
    return (
      <VehicleForm
        vehicle={vehicle.data}
        owners={owners.data}
        defaultOwnerId={searchParams.get('owner') ?? ''}
      />
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={isEdit ? 'Edit vehicle' : 'Add vehicle'}
        description={isEdit ? 'Status is changed on the vehicle details page.' : undefined}
      />
      {renderForm()}
    </div>
  )
}

export default VehicleFormPage
