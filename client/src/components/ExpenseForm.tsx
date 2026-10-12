import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toApiError } from '../api/axios'
import { createExpense, updateExpense } from '../api/expenses'
import { useToast } from '../hooks/useToast'
import { expenseSchema, toExpensePayload, type ExpenseFormValues } from '../schemas/expenseSchema'
import type { Expense } from '../types/expense'
import type { VehicleListItem } from '../types/vehicle'
import { todayInputValue, toDateInputValue } from '../utils/format'
import { expenseCategoryLabels } from '../utils/labels'
import Button from './Button'
import Card from './Card'
import ErrorState from './ErrorState'
import Input from './Input'
import Select from './Select'

const categoryOptions = Object.entries(expenseCategoryLabels).map(([value, label]) => ({ value, label }))

interface ExpenseFormProps {
  expense?: Expense // given = edit it, missing = add a new one
  vehicles: VehicleListItem[]
  defaultVehicleId: string
  onSaved: () => void
  onCancel: () => void
}

function ExpenseForm({ expense, vehicles, defaultVehicleId, onSaved, onCancel }: ExpenseFormProps) {
  const showToast = useToast()
  const [serverError, setServerError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      vehicle: expense?.vehicle._id ?? defaultVehicleId,
      date: expense ? toDateInputValue(expense.date) : todayInputValue(),
      category: expense?.category,
      amount: expense ? String(expense.amount) : '',
    },
  })

  async function onSubmit(values: ExpenseFormValues) {
    setServerError(null)
    try {
      const payload = toExpensePayload(values)
      if (expense) await updateExpense(expense._id, payload)
      else await createExpense(payload)
      showToast(expense ? 'Expense updated' : 'Expense added')
      onSaved()
    } catch (error) {
      setServerError(toApiError(error).message)
    }
  }

  return (
    <Card title={expense ? 'Edit expense' : 'Add expense'}>
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        {serverError && <ErrorState title="Could not save the expense" message={serverError} />}
        <div className="grid gap-4 md:grid-cols-2">
          <Select
            label="Vehicle"
            placeholder="Choose a vehicle"
            options={vehicles.map((vehicle) => ({
              value: vehicle._id,
              label: `${vehicle.plateNumber} · ${vehicle.make} ${vehicle.model}`,
            }))}
            error={errors.vehicle?.message}
            {...register('vehicle')}
          />
          <Input label="Date" type="date" max={todayInputValue()} error={errors.date?.message} {...register('date')} />
          <Select
            label="Category"
            placeholder="Choose a category"
            options={categoryOptions}
            error={errors.category?.message}
            {...register('category')}
          />
          <Input
            label="Amount (₱)"
            type="number"
            min={0}
            step="0.01"
            error={errors.amount?.message}
            {...register('amount')}
          />
        </div>
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save expense'}
          </Button>
        </div>
      </form>
    </Card>
  )
}

export default ExpenseForm
