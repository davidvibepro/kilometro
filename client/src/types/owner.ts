export type OwnerType = 'individual' | 'business'

// An owner as the API sends it
export interface Owner {
  _id: string
  fullName: string
  email?: string
  contactNumber: string
  type?: OwnerType
  createdAt: string
  updatedAt: string
}

// What the client sends on POST and PUT
export interface OwnerPayload {
  fullName: string
  email?: string
  contactNumber: string
  type?: OwnerType
}
