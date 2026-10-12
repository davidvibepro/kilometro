import type { Owner, OwnerPayload } from '../types/owner'
import api from './axios'

export async function getOwners() {
  const { data } = await api.get<Owner[]>('/owners')
  return data
}

export async function getOwner(id: string) {
  const { data } = await api.get<Owner>(`/owners/${id}`)
  return data
}

export async function createOwner(owner: OwnerPayload) {
  const { data } = await api.post<Owner>('/owners', owner)
  return data
}

export async function updateOwner(id: string, owner: OwnerPayload) {
  const { data } = await api.put<Owner>(`/owners/${id}`, owner)
  return data
}

export async function deleteOwner(id: string) {
  const { data } = await api.delete<{ message: string }>(`/owners/${id}`)
  return data
}
