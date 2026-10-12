import type { ServiceLog } from '../types/serviceLog'
import api from './axios'

// GET /service-logs?vehicle= (without a vehicle: every log, newest first)
export async function getServiceLogs(vehicleId = '') {
  const { data } = await api.get<ServiceLog[]>('/service-logs', { params: { vehicle: vehicleId || undefined } })
  return data
}
