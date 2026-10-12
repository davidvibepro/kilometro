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
