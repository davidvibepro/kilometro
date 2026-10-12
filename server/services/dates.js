// Chosen dates ("2026-10-12") are saved as midnight UTC of that day.
// These helpers keep every date calculation in that same form.

const MS_PER_DAY = 24 * 60 * 60 * 1000;

// The local calendar day of a moment, as midnight UTC.
// Example in Manila: 2026-10-12 07:30 local time -> 2026-10-12T00:00:00.000Z
export function startOfDayUtc(date = new Date()) {
  return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
}

export function addDays(date, days) {
  return new Date(date.getTime() + days * MS_PER_DAY);
}

// Jan 31 + 1 month gives Feb 28 (the last day of the month), not Mar 3
export function addMonths(date, months) {
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth() + months;
  const lastDayOfTargetMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  const day = Math.min(date.getUTCDate(), lastDayOfTargetMonth);
  return new Date(Date.UTC(year, month, day));
}

// Whole days from one date to another (negative when `to` is earlier)
export function daysBetween(from, to) {
  return Math.round((to.getTime() - from.getTime()) / MS_PER_DAY);
}

// Any time today is allowed; tomorrow or later is not
export function isNotInFuture(date) {
  return date < addDays(startOfDayUtc(), 1);
}
