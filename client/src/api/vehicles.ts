import type { CostReport, FuelEfficiency, ServiceSchedule } from '../types/reports'
import type {
  Vehicle,
  VehicleDetails,
  VehicleFilters,
  VehicleListItem,
  VehiclePayload,
  VehicleStatus,
} from '../types/vehicle'
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

// D11: the server refuses changes that are not allowed
export async function updateVehicleStatus(id: string, status: VehicleStatus) {
  const { data } = await api.patch<Vehicle>(`/vehicles/${id}/status`, { status })
  return data
}

export async function getServiceSchedule(id: string) {
  const { data } = await api.get<ServiceSchedule>(`/vehicles/${id}/service-schedule`)
  return data
}

export async function getFuelEfficiency(id: string) {
  const { data } = await api.get<FuelEfficiency>(`/vehicles/${id}/fuel-efficiency`)
  return data
}

// from and to are "YYYY-MM-DD" or empty (no limit)
export async function getVehicleCosts(id: string, from: string, to: string) {
  const { data } = await api.get<CostReport>(`/vehicles/${id}/costs`, {
    params: { from: from || undefined, to: to || undefined },
  })
  return data
}
