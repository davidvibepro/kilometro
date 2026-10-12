import type { VehicleType } from './vehicle'

export interface ServiceType {
  _id: string
  name: string
  intervalKm?: number
  intervalMonths?: number
  appliesTo: VehicleType[]
  createdAt: string
  updatedAt: string
}
