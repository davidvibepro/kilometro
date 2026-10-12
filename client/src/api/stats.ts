import type { FleetStats } from '../types/reports'
import api from './axios'

// GET /stats/fleet: spending this month, cost per km ranking, most common service, overdue count (D10)
export async function getFleetStats() {
  const { data } = await api.get<FleetStats>('/stats/fleet')
  return data
}
