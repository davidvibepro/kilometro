import type { VehicleFilters, VehicleListItem } from '../types/vehicle'
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
