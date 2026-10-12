// Answers of the processing endpoints (CLAUDE.md §4)

export type ServiceStatus = 'overdue' | 'due_soon' | 'ok'

// GET /vehicles/:id/service-schedule (D6)
export interface ScheduleItem {
  serviceType: { _id: string; name: string; intervalKm?: number; intervalMonths?: number }
  lastServiceLogId: string | null // null = never logged, counted from when the vehicle was added
  lastKm: number
  lastDate: string
  nextDueKm: number | null
  nextDueDate: string | null
  kmRemaining: number | null
  daysRemaining: number | null
  status: ServiceStatus
}

export interface ServiceSchedule {
  currentOdometer: number
  items: ScheduleItem[]
}

// GET /vehicles/:id/fuel-efficiency (D8)
export interface FuelEfficiencyEntry {
  fuelLogId: string
  date: string
  odometer: number
  kmPerLiter: number
  flagged: boolean
}

export interface FuelEfficiency {
  average: number | null
  best: number | null
  worst: number | null
  entries: FuelEfficiencyEntry[]
  message?: string
}

// GET /vehicles/:id/costs (D9)
export interface CostTotals {
  fuel: number
  service: number
  other: number
  total: number
}

export interface MonthlyCost extends CostTotals {
  month: string // "2026-10"
}

export interface CostReport extends CostTotals {
  from: string | null
  to: string | null
  monthly: MonthlyCost[]
  distance: number
  costPerKm: number | null
}

// GET /reminders (D7), already sorted from most to least urgent (D20)
interface ReminderVehicle {
  _id: string
  plateNumber: string
  make: string
  model: string
}

export interface ServiceReminder {
  kind: 'service'
  status: 'overdue' | 'due_soon'
  vehicle: ReminderVehicle
  serviceType: { _id: string; name: string; intervalKm?: number; intervalMonths?: number }
  nextDueKm: number | null
  nextDueDate: string | null
  kmRemaining: number | null
  daysRemaining: number | null
  shareLeft: number
}

export interface RegistrationReminder {
  kind: 'registration'
  status: 'due_this_month' | 'due_next_month'
  vehicle: ReminderVehicle
  registrationMonth: string
}

export type Reminder = ServiceReminder | RegistrationReminder

// GET /stats/fleet (D10)
export interface RankingRow {
  vehicle: { _id: string; plateNumber: string; make: string; model: string; status: string }
  totalCost: number
  distance: number
  costPerKm: number
}

export interface FleetStats {
  spendingThisMonth: CostTotals
  ranking: RankingRow[] // highest cost per km first
  mostCommonService: { serviceType: { _id: string; name: string }; count: number } | null
  overdueVehicles: number
}
