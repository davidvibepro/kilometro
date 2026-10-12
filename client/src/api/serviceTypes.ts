import type { ServiceType, ServiceTypePayload } from '../types/serviceType'
import api from './axios'

export async function getServiceTypes() {
  const { data } = await api.get<ServiceType[]>('/service-types')
  return data
}

export async function createServiceType(serviceType: ServiceTypePayload) {
  const { data } = await api.post<ServiceType>('/service-types', serviceType)
  return data
}

export async function updateServiceType(id: string, serviceType: ServiceTypePayload) {
  const { data } = await api.put<ServiceType>(`/service-types/${id}`, serviceType)
  return data
}

export async function deleteServiceType(id: string) {
  const { data } = await api.delete<{ message: string }>(`/service-types/${id}`)
  return data
}
