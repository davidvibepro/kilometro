import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { toApiError } from '../api/axios'
import { createServiceLog, updateServiceLog } from '../api/serviceLogs'
import { useToast } from '../hooks/useToast'
import { serviceLogSchema, toServiceLogPayload, type ServiceLogFormValues } from '../schemas/serviceLogSchema'
import type { ServiceLog } from '../types/serviceLog'
import type { ServiceType } from '../types/serviceType'
import type { VehicleListItem } from '../types/vehicle'
import { todayInputValue, toDateInputValue } from '../utils/format'
import Button from './Button'
import Card from './Card'
import ErrorState from './ErrorState'
import Input from './Input'
import Select from './Select'

interface ServiceLogFormProps {
  serviceLog?: ServiceLog // given = edit it, missing = add a new one
  vehicles: VehicleListItem[]
  serviceTypes: ServiceType[]
  defaultVehicleId: string
  onSaved: () => void
  onCancel: () => void
}

function ServiceLogForm({ serviceLog, vehicles, serviceTypes, defaultVehicleId, onSaved, onCancel }: ServiceLogFormProps) {
  const showToast = useToast()
  const [serverError, setServerError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ServiceLogFormValues>({
    resolver: zodResolver(serviceLogSchema),
    defaultValues: {
      vehicle: serviceLog?.vehicle._id ?? defaultVehicleId,
      serviceType: serviceLog?.serviceType._id ?? '',
      date: serviceLog ? toDateInputValue(serviceLog.date) : todayInputValue(),
      odometer: serviceLog ? String(serviceLog.odometer) : '',
      cost: serviceLog?.cost !== undefined ? String(serviceLog.cost) : '',
      shop: serviceLog?.shop ?? '',
    },
  })

  // D13: only offer the services that apply to the chosen vehicle's type
  const vehicleId = useWatch({ control, name: 'vehicle' })
  const vehicleType = vehicles.find((vehicle) => vehicle._id === vehicleId)?.type
  const serviceOptions = serviceTypes
    .filter((type) => !vehicleType || type.appliesTo.includes(vehicleType))
    .map((type) => ({ value: type._id, label: type.name }))

  async function onSubmit(values: ServiceLogFormValues) {
    setServerError(null)
    try {
      const payload = toServiceLogPayload(values)
      if (serviceLog) await updateServiceLog(serviceLog._id, payload)
      else await createServiceLog(payload)
      showToast(serviceLog ? 'Service log updated' : 'Service log added')
      onSaved()
    } catch (error) {
      // e.g. D5: "odometer must be between 1500 and 2000 km for this date"
      setServerError(toApiError(error).message)
    }
  }

  return (
    <Card title={serviceLog ? 'Edit service log' : 'Add service log'}>
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        {serverError && <ErrorState title="Could not save the service log" message={serverError} />}
        <div className="grid gap-4 md:grid-cols-2">
          <Select
            label="Vehicle"
            placeholder="Choose a vehicle"
            options={vehicles.map((vehicle) => ({
              value: vehicle._id,
              label: `${vehicle.plateNumber} · ${vehicle.make} ${vehicle.model}${vehicle.status === 'retired' ? ' (retired)' : ''}`,
            }))}
            error={errors.vehicle?.message}
            {...register('vehicle', { onChange: () => setValue('serviceType', '') })}
          />
          <Select
            label="Service"
            placeholder="Choose a service"
            options={serviceOptions}
            error={errors.serviceType?.message}
            {...register('serviceType')}
          />
          <Input label="Date" type="date" max={todayInputValue()} error={errors.date?.message} {...register('date')} />
          <Input
            label="Odometer (km)"
            type="number"
            min={0}
            inputMode="numeric"
            error={errors.odometer?.message}
            {...register('odometer')}
          />
          <Input
            label="Cost (₱, optional)"
            type="number"
            min={0}
            step="0.01"
            error={errors.cost?.message}
            {...register('cost')}
          />
          <Input label="Shop (optional)" error={errors.shop?.message} {...register('shop')} />
        </div>
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save service log'}
          </Button>
        </div>
      </form>
    </Card>
  )
}

export default ServiceLogForm
