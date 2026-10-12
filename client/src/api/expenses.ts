import type { Expense, ExpenseCategory, ExpensePayload } from '../types/expense'
import api from './axios'

// GET /expenses?vehicle=&category= (empty filters are left out)
export async function getExpenses(vehicleId = '', category: ExpenseCategory | '' = '') {
  const { data } = await api.get<Expense[]>('/expenses', {
    params: { vehicle: vehicleId || undefined, category: category || undefined },
  })
  return data
}

export async function createExpense(expense: ExpensePayload) {
  const { data } = await api.post<Expense>('/expenses', expense)
  return data
}

export async function updateExpense(id: string, expense: ExpensePayload) {
  const { data } = await api.put<Expense>(`/expenses/${id}`, expense)
  return data
}

export async function deleteExpense(id: string) {
  const { data } = await api.delete<{ message: string }>(`/expenses/${id}`)
  return data
}
