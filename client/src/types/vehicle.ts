import type { Owner } from './owner'

export type VehicleType = 'motorcycle' | 'car' | 'suv' | 'van' | 'truck'
export type FuelType = 'gasoline' | 'diesel'
export type VehicleStatus = 'active' | 'in_shop' | 'retired'

interface VehicleBase {
  _id: string
  plateNumber: string
  make: string
  model: string
  year?: number
  type: VehicleType
  fuelType?: FuelType
  startingOdometer: number
  status: VehicleStatus
  createdAt: string
  updatedAt: string
}

// POST, PUT and PATCH answers: owner is only an id
export interface Vehicle extends VehicleBase {
  owner: string
}

// GET /vehicles: owner comes with its name (D17 list)
export interface VehicleListItem extends VehicleBase {
  owner: { _id: string; fullName: string }
}

// GET /vehicles/:id: the full owner, plus the D18 extras
export interface VehicleDetails extends VehicleBase {
  owner: Owner
  currentOdometer: number
  registrationMonth: string
}

// What the client sends on POST and PUT (status only changes through PATCH, D11)
export interface VehiclePayload {
  owner: string
  plateNumber: string
  make: string
  model: string
  year?: number
  type: VehicleType
  fuelType?: FuelType
  startingOdometer: number
}

export interface VehicleFilters {
  type?: VehicleType | ''
  status?: VehicleStatus | ''
  owner?: string
}
