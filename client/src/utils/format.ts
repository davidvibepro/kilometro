// Money is in Philippine pesos, distance in km and fuel in liters (D16)

const pesoFormat = new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' })
const numberFormat = new Intl.NumberFormat('en-PH', { maximumFractionDigits: 2 })

// Dates are saved as midnight UTC of the chosen day, so they are shown in UTC
// to keep the same calendar day in every time zone
const dateFormat = new Intl.DateTimeFormat('en-PH', {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
  timeZone: 'UTC',
})

// 1234.5 -> "₱1,234.50"
export function formatPeso(amount: number): string {
  return pesoFormat.format(amount)
}

// 15230 -> "15,230 km"
export function formatKm(km: number): string {
  return `${numberFormat.format(km)} km`
}

// 3.5 -> "3.5 L"
export function formatLiters(liters: number): string {
  return `${numberFormat.format(liters)} L`
}

// 42.456 -> "42.46 km/L"
export function formatKmPerLiter(kmPerLiter: number): string {
  return `${numberFormat.format(kmPerLiter)} km/L`
}

// "2026-10-12T00:00:00.000Z" -> "Oct 12, 2026"
export function formatDate(date: string): string {
  return dateFormat.format(new Date(date))
}

// "2026-10-12T00:00:00.000Z" -> "2026-10-12", the value an <input type="date"> expects
export function toDateInputValue(date: string): string {
  return date.slice(0, 10)
}

// Today's local date as "YYYY-MM-DD": the default for date fields and the latest date allowed (D14)
export function todayInputValue(): string {
  const now = new Date()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${now.getFullYear()}-${month}-${day}`
}

const monthFormat = new Intl.DateTimeFormat('en-PH', { year: 'numeric', month: 'short', timeZone: 'UTC' })

// "2026-10" -> "Oct 2026" (the month rows of the cost report)
export function formatMonth(month: string): string {
  return monthFormat.format(new Date(`${month}-01T00:00:00.000Z`))
}

// A service's distance and time left (D6), e.g. "300 km left · 8 days left" or "100 km past due"
export function formatRemaining(kmRemaining: number | null, daysRemaining: number | null): string {
  const parts: string[] = []
  if (kmRemaining !== null) {
    parts.push(kmRemaining > 0 ? `${formatKm(kmRemaining)} left` : `${formatKm(-kmRemaining)} past due`)
  }
  if (daysRemaining !== null) {
    if (daysRemaining > 0) parts.push(`${daysRemaining} day${daysRemaining === 1 ? '' : 's'} left`)
    else if (daysRemaining === 0) parts.push('due today')
    else parts.push(`${-daysRemaining} day${daysRemaining === -1 ? '' : 's'} past due`)
  }
  return parts.join(' · ')
}
