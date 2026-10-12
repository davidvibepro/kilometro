import type { Reminder } from '../types/reports'
import api from './axios'

// GET /reminders: active vehicles only, sorted from most to least urgent (D7, D20)
export async function getReminders() {
  const { data } = await api.get<Reminder[]>('/reminders')
  return data
}
