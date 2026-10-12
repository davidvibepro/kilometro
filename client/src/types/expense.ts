import type { VehicleSummary } from './vehicle'

export type ExpenseCategory = 'registration' | 'insurance' | 'parts' | 'parking' | 'toll' | 'wash' | 'other'

// An expense as GET /expenses sends it (vehicle filled in)
export interface Expense {
  _id: string
  vehicle: VehicleSummary
  date: string
  category: ExpenseCategory
  amount: number
  createdAt: string
  updatedAt: string
}

// What the client sends on POST and PUT (date as "YYYY-MM-DD")
export interface ExpensePayload {
  vehicle: string
  date: string
  category: ExpenseCategory
  amount: number
}
