import type { OwnerType } from '../types/owner'
import type { FuelType, VehicleStatus, VehicleType } from '../types/vehicle'

// Human-readable names for the enum values stored in the database

export const ownerTypeLabels: Record<OwnerType, string> = {
  individual: 'Individual',
  business: 'Business',
}

export const vehicleTypeLabels: Record<VehicleType, string> = {
  motorcycle: 'Motorcycle',
  car: 'Car',
  suv: 'SUV',
  van: 'Van',
  truck: 'Truck',
}

export const fuelTypeLabels: Record<FuelType, string> = {
  gasoline: 'Gasoline',
  diesel: 'Diesel',
}

export const vehicleStatusLabels: Record<VehicleStatus, string> = {
  active: 'Active',
  in_shop: 'In shop',
  retired: 'Retired',
}
