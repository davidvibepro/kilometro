import { z } from 'zod'
import type { ServiceTypePayload } from '../types/serviceType'

// The same rules as the ServiceType model on the server.
// Number inputs give text, so the intervals are checked as text and turned into numbers in toServiceTypePayload().
export const serviceTypeSchema = z
  .object({
    name: z.string().trim().min(1, 'Name is required'),
    intervalKm: z
      .string()
      .trim()
      .refine((value) => value === '' || Number(value) >= 0, 'Interval in km must be a number, 0 or more'),
    intervalMonths: z
      .string()
      .trim()
      .refine(
        (value) => value === '' || (Number(value) >= 0 && Number(value) <= 60),
        'Interval in months must be a number from 0 to 60'
      ),
    appliesTo: z.array(z.enum(['motorcycle', 'car', 'suv', 'van', 'truck'])),
  })
  // At least one interval, otherwise the service can never become due ("" counts as 0)
  .refine((values) => Number(values.intervalKm) > 0 || Number(values.intervalMonths) > 0, {
    message: 'Enter an interval in km, in months, or both',
    path: ['intervalKm'],
  })

export type ServiceTypeFormValues = z.infer<typeof serviceTypeSchema>

// Empty intervals are left out (no limit of that kind)
export function toServiceTypePayload(values: ServiceTypeFormValues): ServiceTypePayload {
  return {
    name: values.name,
    intervalKm: values.intervalKm === '' ? undefined : Number(values.intervalKm),
    intervalMonths: values.intervalMonths === '' ? undefined : Number(values.intervalMonths),
    appliesTo: values.appliesTo,
  }
}
