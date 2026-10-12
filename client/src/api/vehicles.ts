import type { Vehicle, VehicleDetails, VehicleFilters, VehicleListItem, VehiclePayload } from '../types/vehicle'
import api from './axios'

// GET /vehicles?type=&status=&owner= (empty filters are left out)
export async function getVehicles(filters: VehicleFilters = {}) {
  const { data } = await api.get<VehicleListItem[]>('/vehicles', {
    params: {
      type: filters.type || undefined,
      status: filters.status || undefined,
      owner: filters.owner || undefined,
    },
  })
  return data
}

export async function getVehicle(id: string) {
  const { data } = await api.get<VehicleDetails>(`/vehicles/${id}`)
  return data
}

export async function createVehicle(vehicle: VehiclePayload) {
  const { data } = await api.post<Vehicle>('/vehicles', vehicle)
  return data
}

export async function updateVehicle(id: string, vehicle: VehiclePayload) {
  const { data } = await api.put<Vehicle>(`/vehicles/${id}`, vehicle)
  return data
}

// The answer's message says how many logs and expenses were removed too (D12)
export async function deleteVehicle(id: string) {
  const { data } = await api.delete<{ message: string }>(`/vehicles/${id}`)
  return data
}
