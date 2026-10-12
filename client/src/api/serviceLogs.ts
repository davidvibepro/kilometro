import type { ServiceLog, ServiceLogPayload } from '../types/serviceLog'
import api from './axios'

// GET /service-logs?vehicle= (without a vehicle: every log, newest first)
export async function getServiceLogs(vehicleId = '') {
  const { data } = await api.get<ServiceLog[]>('/service-logs', { params: { vehicle: vehicleId || undefined } })
  return data
}

// The server checks the odometer rule (D5) and the service type (D13) and answers 400 when broken
export async function createServiceLog(serviceLog: ServiceLogPayload) {
  const { data } = await api.post<ServiceLog>('/service-logs', serviceLog)
  return data
}

export async function updateServiceLog(id: string, serviceLog: ServiceLogPayload) {
  const { data } = await api.put<ServiceLog>(`/service-logs/${id}`, serviceLog)
  return data
}

export async function deleteServiceLog(id: string) {
  const { data } = await api.delete<{ message: string }>(`/service-logs/${id}`)
  return data
}
