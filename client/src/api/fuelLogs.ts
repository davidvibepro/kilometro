import type { FuelLog } from '../types/fuelLog'
import api from './axios'

// GET /fuel-logs?vehicle= (without a vehicle: every fill-up, newest first)
export async function getFuelLogs(vehicleId = '') {
  const { data } = await api.get<FuelLog[]>('/fuel-logs', { params: { vehicle: vehicleId || undefined } })
  return data
}
