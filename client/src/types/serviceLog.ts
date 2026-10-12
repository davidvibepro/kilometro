import type { VehicleSummary } from './vehicle'

// A service log as GET /service-logs sends it (vehicle and service type filled in)
export interface ServiceLog {
  _id: string
  vehicle: VehicleSummary
  serviceType: { _id: string; name: string }
  date: string
  odometer: number
  cost?: number
  shop?: string
  createdAt: string
  updatedAt: string
}

// What the client sends on POST and PUT (date as "YYYY-MM-DD")
export interface ServiceLogPayload {
  vehicle: string
  serviceType: string
  date: string
  odometer: number
  cost?: number
  shop?: string
}
