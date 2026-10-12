import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toApiError } from '../api/axios'
import { createServiceType, updateServiceType } from '../api/serviceTypes'
import { useToast } from '../hooks/useToast'
import {
  serviceTypeSchema,
  toServiceTypePayload,
  type ServiceTypeFormValues,
} from '../schemas/serviceTypeSchema'
import type { ServiceType } from '../types/serviceType'
import { vehicleTypeLabels } from '../utils/labels'
import Button from './Button'
import Card from './Card'
import ErrorState from './ErrorState'
import FieldError from './FieldError'
import Input from './Input'

const vehicleTypeOptions = Object.entries(vehicleTypeLabels).map(([value, label]) => ({ value, label }))

interface ServiceTypeFormProps {
  serviceType?: ServiceType // given = edit it, missing = add a new one
  onSaved: () => void
  onCancel: () => void
}

function ServiceTypeForm({ serviceType, onSaved, onCancel }: ServiceTypeFormProps) {
  const showToast = useToast()
  const [serverError, setServerError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ServiceTypeFormValues>({
    resolver: zodResolver(serviceTypeSchema),
    defaultValues: {
      name: serviceType?.name ?? '',
      intervalKm: serviceType?.intervalKm ? String(serviceType.intervalKm) : '',
      intervalMonths: serviceType?.intervalMonths ? String(serviceType.intervalMonths) : '',
      appliesTo: serviceType?.appliesTo ?? [],
    },
  })

  async function onSubmit(values: ServiceTypeFormValues) {
    setServerError(null)
    try {
      const payload = toServiceTypePayload(values)
      if (serviceType) await updateServiceType(serviceType._id, payload)
      else await createServiceType(payload)
      showToast(serviceType ? 'Service type updated' : 'Service type added')
      onSaved()
    } catch (error) {
      // e.g. 400 "name already exists" from the server
      setServerError(toApiError(error).message)
    }
  }

  return (
    <Card title={serviceType ? 'Edit service type' : 'Add service type'}>
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        {serverError && <ErrorState title="Could not save the service type" message={serverError} />}
        <Input label="Name" placeholder="Change oil" error={errors.name?.message} {...register('name')} />
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Every ... km (optional)"
            type="number"
            min={0}
            placeholder="5000"
            error={errors.intervalKm?.message}
            {...register('intervalKm')}
          />
          <Input
            label="Every ... months (optional)"
            type="number"
            min={0}
            max={60}
            placeholder="6"
            error={errors.intervalMonths?.message}
            {...register('intervalMonths')}
          />
        </div>
        <p className="text-xs text-ink/60">The service is due by distance or by time, whichever comes first.</p>

        <fieldset>
          <legend className="mb-2 text-sm font-medium">Applies to</legend>
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            {vehicleTypeOptions.map((option) => (
              <label key={option.value} className="flex items-center gap-2 text-sm">
                <input type="checkbox" value={option.value} className="size-4 accent-primary" {...register('appliesTo')} />
                {option.label}
              </label>
            ))}
          </div>
          <FieldError message={errors.appliesTo?.message} />
        </fieldset>

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save service type'}
          </Button>
        </div>
      </form>
    </Card>
  )
}

export default ServiceTypeForm
