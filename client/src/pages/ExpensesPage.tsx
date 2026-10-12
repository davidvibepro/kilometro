import { useCallback, useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { toApiError } from '../api/axios'
import { deleteExpense, getExpenses } from '../api/expenses'
import { getVehicles } from '../api/vehicles'
import Button from '../components/Button'
import ConfirmDialog from '../components/ConfirmDialog'
import EmptyState from '../components/EmptyState'
import ErrorState from '../components/ErrorState'
import ExpenseForm from '../components/ExpenseForm'
import LoadingState from '../components/LoadingState'
import PageHeader from '../components/PageHeader'
import Select from '../components/Select'
import {
  cardItemClasses,
  cardListClasses,
  linkClasses,
  rowClasses,
  tableClasses,
  tableWrapperClasses,
  tdClasses,
  theadRowClasses,
  thClasses,
} from '../components/tableStyles'
import { useApi } from '../hooks/useApi'
import { useToast } from '../hooks/useToast'
import type { Expense, ExpenseCategory } from '../types/expense'
import { formatDate, formatPeso } from '../utils/format'
import { expenseCategoryLabels } from '../utils/labels'

const categoryOptions = Object.entries(expenseCategoryLabels).map(([value, label]) => ({ value, label }))

function ExpensesPage() {
  // Both filters live in the URL (?vehicle=&category=, D17), so other pages can link here
  const [searchParams, setSearchParams] = useSearchParams()
  const vehicleFilter = searchParams.get('vehicle') ?? ''
  const categoryFilter = (searchParams.get('category') ?? '') as ExpenseCategory | ''
  const showToast = useToast()

  const loadExpenses = useCallback(() => getExpenses(vehicleFilter, categoryFilter), [vehicleFilter, categoryFilter])
  const { data: expenses, loading, error, refetch } = useApi(loadExpenses)
  const vehicles = useApi(getVehicles)

  const [formExpense, setFormExpense] = useState<Expense | 'new' | null>(null)
  const [expenseToDelete, setExpenseToDelete] = useState<Expense | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  // Keeps the other filter when one of them changes; empty values are left out of the URL
  function changeFilter(name: 'vehicle' | 'category', value: string) {
    const next = { vehicle: vehicleFilter, category: categoryFilter, [name]: value }
    setSearchParams(Object.fromEntries(Object.entries(next).filter(([, filterValue]) => filterValue !== '')))
  }

  function openForm(expense: Expense | 'new') {
    setFormExpense(expense)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function handleSaved() {
    setFormExpense(null)
    refetch()
  }

  async function confirmDelete() {
    if (!expenseToDelete) return
    setDeleting(true)
    setDeleteError(null)
    try {
      await deleteExpense(expenseToDelete._id)
      showToast('Expense deleted')
      refetch()
    } catch (err) {
      setDeleteError(toApiError(err).message)
    } finally {
      setDeleting(false)
      setExpenseToDelete(null)
    }
  }

  function renderForm() {
    if (!formExpense) return null
    if (vehicles.loading) return <LoadingState />
    if (vehicles.error) return <ErrorState message={vehicles.error.message} onRetry={vehicles.refetch} />
    return (
      <ExpenseForm
        key={formExpense === 'new' ? 'new' : formExpense._id}
        expense={formExpense === 'new' ? undefined : formExpense}
        vehicles={vehicles.data ?? []}
        defaultVehicleId={vehicleFilter}
        onSaved={handleSaved}
        onCancel={() => setFormExpense(null)}
      />
    )
  }

  function renderExpenses() {
    if (loading) return <LoadingState message="Loading expenses..." />
    if (error) return <ErrorState message={error.message} onRetry={refetch} />
    if (!expenses || expenses.length === 0) {
      return (
        <EmptyState
          message={vehicleFilter || categoryFilter ? 'No expenses match these filters.' : 'No expenses yet.'}
          action={<Button onClick={() => openForm('new')}>Add expense</Button>}
        />
      )
    }

    // Derived during render: the total of the expenses in the list
    const total = expenses.reduce((sum, expense) => sum + expense.amount, 0)

    const actions = (expense: Expense) => (
      <div className="flex gap-2">
        <Button variant="secondary" size="sm" onClick={() => openForm(expense)}>
          Edit
        </Button>
        <Button variant="danger" size="sm" onClick={() => setExpenseToDelete(expense)}>
          Delete
        </Button>
      </div>
    )

    return (
      <>
        <p className="text-sm text-ink/70">
          {expenses.length} expense{expenses.length === 1 ? '' : 's'} · total{' '}
          <span className="font-semibold text-ink">{formatPeso(total)}</span>
        </p>

        <div className={tableWrapperClasses}>
          <table className={tableClasses}>
            <thead>
              <tr className={theadRowClasses}>
                <th className={thClasses}>Date</th>
                <th className={thClasses}>Vehicle</th>
                <th className={thClasses}>Category</th>
                <th className={`${thClasses} text-right`}>Amount</th>
                <th className={thClasses}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((expense) => (
                <tr key={expense._id} className={rowClasses}>
                  <td className={`${tdClasses} whitespace-nowrap`}>{formatDate(expense.date)}</td>
                  <td className={tdClasses}>
                    <Link to={`/vehicles/${expense.vehicle._id}`} className={linkClasses}>
                      {expense.vehicle.plateNumber}
                    </Link>
                  </td>
                  <td className={tdClasses}>{expenseCategoryLabels[expense.category]}</td>
                  <td className={`${tdClasses} text-right whitespace-nowrap`}>{formatPeso(expense.amount)}</td>
                  <td className={tdClasses}>{actions(expense)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <ul className={cardListClasses}>
          {expenses.map((expense) => (
            <li key={expense._id} className={cardItemClasses}>
              <div className="flex items-start justify-between gap-3">
                <p className="font-semibold">{expenseCategoryLabels[expense.category]}</p>
                <span className="font-semibold">{formatPeso(expense.amount)}</span>
              </div>
              <p className="mt-1 text-sm text-ink/70">
                {formatDate(expense.date)} ·{' '}
                <Link to={`/vehicles/${expense.vehicle._id}`} className={linkClasses}>
                  {expense.vehicle.plateNumber}
                </Link>
              </p>
              <div className="mt-3">{actions(expense)}</div>
            </li>
          ))}
        </ul>
      </>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Expenses"
        description="Other costs of owning each vehicle"
        action={<Button onClick={() => openForm('new')}>Add expense</Button>}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:max-w-2xl">
        <Select
          label="Vehicle"
          placeholder="All vehicles"
          options={(vehicles.data ?? []).map((vehicle) => ({
            value: vehicle._id,
            label: `${vehicle.plateNumber} · ${vehicle.make} ${vehicle.model}`,
          }))}
          value={vehicleFilter}
          onChange={(event) => changeFilter('vehicle', event.target.value)}
        />
        <Select
          label="Category"
          placeholder="All categories"
          options={categoryOptions}
          value={categoryFilter}
          onChange={(event) => changeFilter('category', event.target.value)}
        />
      </div>

      {renderForm()}

      {deleteError && <ErrorState title="Could not delete the expense" message={deleteError} />}

      {renderExpenses()}

      <ConfirmDialog
        open={expenseToDelete !== null}
        title="Delete this expense?"
        message={
          expenseToDelete
            ? `${expenseCategoryLabels[expenseToDelete.category]} of ${formatPeso(expenseToDelete.amount)} on ${formatDate(expenseToDelete.date)} for ${expenseToDelete.vehicle.plateNumber} will be removed.`
            : ''
        }
        deleting={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setExpenseToDelete(null)}
      />
    </div>
  )
}

export default ExpensesPage
