import { z } from 'zod'
import type { FuelLogPayload } from '../types/fuelLog'
import { todayInputValue } from '../utils/format'

// The schema rules of the FuelLog model (D14, D19). The odometer rule (D5) needs the
// vehicle's other logs, so the server checks it and its 400 message is shown in the form.
export const fuelLogSchema = z.object({
  vehicle: z.string().min(1, 'Choose a vehicle'),
  // "YYYY-MM-DD" text can be compared as text: a later date is a bigger string
  date: z
    .string()
    .min(1, 'Date is required')
    .refine((value) => value <= todayInputValue(), 'Date cannot be in the future'),
  odometer: z
    .string()
    .trim()
    .min(1, 'Odometer reading is required')
    .refine((value) => Number(value) >= 0, 'Odometer must be a number, 0 or more'),
  liters: z
    .string()
    .trim()
    .min(1, 'Liters is required')
    .refine((value) => Number(value) >= 0.1 && Number(value) <= 200, 'Liters must be from 0.1 to 200'),
  pricePerLiter: z
    .string()
    .trim()
    .min(1, 'Price per liter is required')
    .refine((value) => Number(value) >= 1, 'Price per liter must be at least ₱1'),
  fullTank: z.boolean(),
})

export type FuelLogFormValues = z.infer<typeof fuelLogSchema>

export function toFuelLogPayload(values: FuelLogFormValues): FuelLogPayload {
  return {
    vehicle: values.vehicle,
    date: values.date,
    odometer: Number(values.odometer),
    liters: Number(values.liters),
    pricePerLiter: Number(values.pricePerLiter),
    fullTank: values.fullTank,
  }
}
