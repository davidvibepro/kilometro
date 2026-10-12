import type { FuelLog, FuelLogPayload } from '../types/fuelLog'
import api from './axios'

// GET /fuel-logs?vehicle= (without a vehicle: every fill-up, newest first)
export async function getFuelLogs(vehicleId = '') {
  const { data } = await api.get<FuelLog[]>('/fuel-logs', { params: { vehicle: vehicleId || undefined } })
  return data
}

// The server checks the odometer rule (D5) and answers 400 when it is broken
export async function createFuelLog(fuelLog: FuelLogPayload) {
  const { data } = await api.post<FuelLog>('/fuel-logs', fuelLog)
  return data
}

export async function updateFuelLog(id: string, fuelLog: FuelLogPayload) {
  const { data } = await api.put<FuelLog>(`/fuel-logs/${id}`, fuelLog)
  return data
}

export async function deleteFuelLog(id: string) {
  const { data } = await api.delete<{ message: string }>(`/fuel-logs/${id}`)
  return data
}
