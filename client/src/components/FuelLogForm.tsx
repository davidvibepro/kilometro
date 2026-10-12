import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { toApiError } from '../api/axios'
import { createFuelLog, updateFuelLog } from '../api/fuelLogs'
import { useToast } from '../hooks/useToast'
import { fuelLogSchema, toFuelLogPayload, type FuelLogFormValues } from '../schemas/fuelLogSchema'
import type { FuelLog } from '../types/fuelLog'
import type { VehicleListItem } from '../types/vehicle'
import { formatPeso, todayInputValue, toDateInputValue } from '../utils/format'
import Button from './Button'
import Card from './Card'
import ErrorState from './ErrorState'
import Input from './Input'
import Select from './Select'

interface FuelLogFormProps {
  fuelLog?: FuelLog // given = edit it, missing = add a new one
  vehicles: VehicleListItem[]
  defaultVehicleId: string
  onSaved: () => void
  onCancel: () => void
}

function FuelLogForm({ fuelLog, vehicles, defaultVehicleId, onSaved, onCancel }: FuelLogFormProps) {
  const showToast = useToast()
  const [serverError, setServerError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<FuelLogFormValues>({
    resolver: zodResolver(fuelLogSchema),
    defaultValues: {
      vehicle: fuelLog?.vehicle._id ?? defaultVehicleId,
      date: fuelLog ? toDateInputValue(fuelLog.date) : todayInputValue(),
      odometer: fuelLog ? String(fuelLog.odometer) : '',
      liters: fuelLog ? String(fuelLog.liters) : '',
      pricePerLiter: fuelLog ? String(fuelLog.pricePerLiter) : '',
      fullTank: fuelLog?.fullTank ?? true,
    },
  })

  // Derived during render: the cost of this fill-up while the user types
  const [liters, pricePerLiter] = useWatch({ control, name: ['liters', 'pricePerLiter'] })
  const cost = Number(liters) * Number(pricePerLiter)

  async function onSubmit(values: FuelLogFormValues) {
    setServerError(null)
    try {
      const payload = toFuelLogPayload(values)
      if (fuelLog) await updateFuelLog(fuelLog._id, payload)
      else await createFuelLog(payload)
      showToast(fuelLog ? 'Fill-up updated' : 'Fill-up added')
      onSaved()
    } catch (error) {
      // e.g. D5: "odometer must be at least 13250 km for this date"
      setServerError(toApiError(error).message)
    }
  }

  return (
    <Card title={fuelLog ? 'Edit fill-up' : 'Add fill-up'}>
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        {serverError && <ErrorState title="Could not save the fill-up" message={serverError} />}
        <div className="grid gap-4 md:grid-cols-2">
          <Select
            label="Vehicle"
            placeholder="Choose a vehicle"
            options={vehicles.map((vehicle) => ({
              value: vehicle._id,
              label: `${vehicle.plateNumber} · ${vehicle.make} ${vehicle.model}${vehicle.status === 'retired' ? ' (retired)' : ''}`,
            }))}
            error={errors.vehicle?.message}
            {...register('vehicle')}
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
            label="Liters"
            type="number"
            min={0.1}
            max={200}
            step="0.01"
            error={errors.liters?.message}
            {...register('liters')}
          />
          <Input
            label="Price per liter (₱)"
            type="number"
            min={1}
            step="0.01"
            error={errors.pricePerLiter?.message}
            {...register('pricePerLiter')}
          />
          <div className="flex flex-col justify-end gap-2">
            <label className="flex items-center gap-2 text-sm font-medium">
              <input type="checkbox" className="size-4 accent-primary" {...register('fullTank')} />
              Filled the tank to full
            </label>
            <p className="text-xs text-ink/60">Km per liter is worked out between full-tank fill-ups.</p>
          </div>
        </div>
        <p className="text-sm">
          Cost of this fill-up:{' '}
          <span className="font-semibold">{Number.isFinite(cost) && cost > 0 ? formatPeso(cost) : '—'}</span>
        </p>
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save fill-up'}
          </Button>
        </div>
      </form>
    </Card>
  )
}

export default FuelLogForm
