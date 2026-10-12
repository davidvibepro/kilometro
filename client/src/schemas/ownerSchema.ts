import { z } from 'zod'
import type { OwnerPayload } from '../types/owner'

// The same rules as the Owner model on the server (D2, D3)
export const ownerSchema = z.object({
  fullName: z.string().trim().min(1, 'Full name is required'),
  email: z.union([z.literal(''), z.email('Enter a valid email address')]),
  contactNumber: z.string().trim().regex(/^09\d{9}$/, 'Use 11 digits starting with 09, e.g. 09171234567'),
  type: z.union([z.literal(''), z.enum(['individual', 'business'])]),
})

export type OwnerFormValues = z.infer<typeof ownerSchema>

// Empty optional fields are left out, so the server stores "no email" / "no type"
export function toOwnerPayload(values: OwnerFormValues): OwnerPayload {
  return {
    fullName: values.fullName,
    email: values.email || undefined,
    contactNumber: values.contactNumber,
    type: values.type || undefined,
  }
}
