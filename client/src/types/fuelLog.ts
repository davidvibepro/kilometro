import type { VehicleSummary } from './vehicle'

// A fill-up as GET /fuel-logs sends it (vehicle filled in)
export interface FuelLog {
  _id: string
  vehicle: VehicleSummary
  date: string
  odometer: number
  liters: number
  pricePerLiter: number
  fullTank: boolean
  createdAt: string
  updatedAt: string
}

// What the client sends on POST and PUT (date as "YYYY-MM-DD")
export interface FuelLogPayload {
  vehicle: string
  date: string
  odometer: number
  liters: number
  pricePerLiter: number
  fullTank: boolean
}
