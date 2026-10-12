import { z } from 'zod'
import type { VehiclePayload } from '../types/vehicle'

const nextYear = () => new Date().getFullYear() + 1

// The same rules as the Vehicle model on the server (D1, D15, D19).
// Number inputs give text, so year and startingOdometer are checked as text
// and turned into numbers in toVehiclePayload().
export const vehicleSchema = z.object({
  owner: z.string().min(1, 'Choose an owner'),
  plateNumber: z
    .string()
    .trim()
    .min(4, 'Plate number must be 4 to 10 characters')
    .max(10, 'Plate number must be 4 to 10 characters')
    .regex(/^[A-Za-z0-9]+([ -][A-Za-z0-9]+)*$/, 'Use letters and digits, separated by single spaces or dashes')
    .regex(/\d/, 'Plate number must contain at least one digit'),
  make: z.string().trim().min(1, 'Make is required'),
  model: z.string().trim().min(1, 'Model is required'),
  year: z
    .string()
    .trim()
    .refine(
      (value) => value === '' || (Number.isInteger(Number(value)) && Number(value) >= 1980 && Number(value) <= nextYear()),
      `Year must be a whole number from 1980 to ${nextYear()}`
    ),
  type: z.enum(['motorcycle', 'car', 'suv', 'van', 'truck'], { error: 'Choose a vehicle type' }),
  fuelType: z.union([z.literal(''), z.enum(['gasoline', 'diesel'])]),
  startingOdometer: z
    .string()
    .trim()
    .min(1, 'Starting odometer is required')
    .refine((value) => Number(value) >= 0, 'Starting odometer must be a number, 0 or more'),
})

export type VehicleFormValues = z.infer<typeof vehicleSchema>

// Text fields become numbers; empty optional fields are left out
export function toVehiclePayload(values: VehicleFormValues): VehiclePayload {
  return {
    owner: values.owner,
    plateNumber: values.plateNumber,
    make: values.make,
    model: values.model,
    year: values.year === '' ? undefined : Number(values.year),
    type: values.type,
    fuelType: values.fuelType || undefined,
    startingOdometer: Number(values.startingOdometer),
  }
}
