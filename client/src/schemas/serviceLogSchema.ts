import { z } from 'zod'
import type { ServiceLogPayload } from '../types/serviceLog'
import { todayInputValue } from '../utils/format'

// The schema rules of the ServiceLog model. The odometer rule (D5) and the
// service type check (D13) need other records, so the server checks them and
// its 400 message is shown in the form.
export const serviceLogSchema = z.object({
  vehicle: z.string().min(1, 'Choose a vehicle'),
  serviceType: z.string().min(1, 'Choose a service'),
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
  cost: z
    .string()
    .trim()
    .refine((value) => value === '' || Number(value) >= 0, 'Cost must be a number, 0 or more'),
  shop: z.string().trim(),
})

export type ServiceLogFormValues = z.infer<typeof serviceLogSchema>

// Text fields become numbers; empty optional fields are left out
export function toServiceLogPayload(values: ServiceLogFormValues): ServiceLogPayload {
  return {
    vehicle: values.vehicle,
    serviceType: values.serviceType,
    date: values.date,
    odometer: Number(values.odometer),
    cost: values.cost === '' ? undefined : Number(values.cost),
    shop: values.shop || undefined,
  }
}
