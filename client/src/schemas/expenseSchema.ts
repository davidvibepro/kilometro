import { z } from 'zod'
import type { ExpensePayload } from '../types/expense'
import { todayInputValue } from '../utils/format'

// The same rules as the Expense model on the server (D14, D19)
export const expenseSchema = z.object({
  vehicle: z.string().min(1, 'Choose a vehicle'),
  // "YYYY-MM-DD" text can be compared as text: a later date is a bigger string
  date: z
    .string()
    .min(1, 'Date is required')
    .refine((value) => value <= todayInputValue(), 'Date cannot be in the future'),
  category: z.enum(['registration', 'insurance', 'parts', 'parking', 'toll', 'wash', 'other'], {
    error: 'Choose a category',
  }),
  amount: z
    .string()
    .trim()
    .min(1, 'Amount is required')
    .refine((value) => Number(value) >= 0, 'Amount must be a number, 0 or more'),
})

export type ExpenseFormValues = z.infer<typeof expenseSchema>

export function toExpensePayload(values: ExpenseFormValues): ExpensePayload {
  return {
    vehicle: values.vehicle,
    date: values.date,
    category: values.category,
    amount: Number(values.amount),
  }
}
