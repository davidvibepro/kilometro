import type { Expense, ExpenseCategory } from '../types/expense'
import api from './axios'

// GET /expenses?vehicle=&category= (empty filters are left out)
export async function getExpenses(vehicleId = '', category: ExpenseCategory | '' = '') {
  const { data } = await api.get<Expense[]>('/expenses', {
    params: { vehicle: vehicleId || undefined, category: category || undefined },
  })
  return data
}
