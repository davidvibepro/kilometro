import { addDays } from './dates.js';

function badRequest(message) {
  const error = new Error(message);
  error.status = 400; // errorHandler sends it as 400 { message }
  return error;
}

function roundTo2(value) {
  return Math.round(value * 100) / 100;
}

// "2026-10-01" -> Date. Rejects other formats and impossible days like 2026-02-30,
// which JavaScript would otherwise quietly turn into March 2.
function parseDay(text, name) {
  const date = new Date(text);
  const isValid = /^\d{4}-\d{2}-\d{2}$/.test(text) && !Number.isNaN(date.getTime());
  if (!isValid || date.toISOString().slice(0, 10) !== text) {
    throw badRequest(`${name} must be a valid date in YYYY-MM-DD format`);
  }
  return date;
}

// D9: `from` and `to` are optional (missing or empty = no limit).
// Invalid dates, or from after to, are a 400.
export function parseDateRange(fromText, toText) {
  const from = fromText ? parseDay(fromText, 'from') : null;
  const to = toText ? parseDay(toText, 'to') : null;
  if (from && to && from > to) {
    throw badRequest('from must be on or before to');
  }
  return { from, to };
}

// A missing `from` or `to` means no limit on that side. The whole `to` day is included.
export function isInRange(date, from, to) {
  if (from && date < from) return false;
  if (to && date >= addDays(to, 1)) return false;
  return true;
}

// Fuel = liters x price per liter, service = cost, other = expense amount (D9).
// D21: each record is rounded to the centavo before adding (that is what was paid),
// so totals by month, by vehicle and for the fleet always add up exactly.
export function sumCosts(fuelLogs, serviceLogs, expenses) {
  const fuel = roundTo2(fuelLogs.reduce((sum, log) => sum + roundTo2(log.liters * log.pricePerLiter), 0));
  const service = roundTo2(serviceLogs.reduce((sum, log) => sum + roundTo2(log.cost ?? 0), 0));
  const other = roundTo2(expenses.reduce((sum, expense) => sum + roundTo2(expense.amount), 0));
  return { fuel, service, other, total: roundTo2(fuel + service + other) };
}

export function getCostPerKm(total, distance) {
  return distance > 0 ? roundTo2(total / distance) : null;
}

// One row per month ("2026-10") with fuel, service, other and total
function buildMonthlyRows(fuelLogs, serviceLogs, expenses) {
  const months = new Map();
  const addRecord = (record, listName) => {
    const month = record.date.toISOString().slice(0, 7);
    if (!months.has(month)) months.set(month, { fuelLogs: [], serviceLogs: [], expenses: [] });
    months.get(month)[listName].push(record);
  };

  fuelLogs.forEach((log) => addRecord(log, 'fuelLogs'));
  serviceLogs.forEach((log) => addRecord(log, 'serviceLogs'));
  expenses.forEach((expense) => addRecord(expense, 'expenses'));

  return [...months.keys()].sort().map((month) => {
    const records = months.get(month);
    return { month, ...sumCosts(records.fuelLogs, records.serviceLogs, records.expenses) };
  });
}

// D9: cost report for ONE vehicle. Pass ALL of its logs and expenses:
// the readings before `from` are needed to work out the distance.
export function buildCostReport({ vehicle, fuelLogs, serviceLogs, expenses, from = null, to = null }) {
  const inRange = (record) => isInRange(record.date, from, to);
  const fuelInRange = fuelLogs.filter(inRange);
  const serviceInRange = serviceLogs.filter(inRange);
  const expensesInRange = expenses.filter(inRange);

  const totals = sumCosts(fuelInRange, serviceInRange, expensesInRange);

  // distance = highest reading in the range - highest reading before it (or startingOdometer)
  const readings = [...fuelLogs, ...serviceLogs];
  const inRangeKm = readings.filter(inRange).map((log) => log.odometer);
  const beforeKm = from ? readings.filter((log) => log.date < from).map((log) => log.odometer) : [];
  const startKm = beforeKm.length > 0 ? Math.max(...beforeKm) : vehicle.startingOdometer;
  const distance = inRangeKm.length > 0 ? Math.max(...inRangeKm) - startKm : 0;

  return {
    from,
    to,
    ...totals,
    monthly: buildMonthlyRows(fuelInRange, serviceInRange, expensesInRange),
    distance,
    costPerKm: getCostPerKm(totals.total, distance),
  };
}

// D10: the first and last day of the current calendar month
export function getCurrentMonthRange(today = new Date()) {
  return {
    from: new Date(Date.UTC(today.getFullYear(), today.getMonth(), 1)),
    to: new Date(Date.UTC(today.getFullYear(), today.getMonth() + 1, 0)),
  };
}

// D10: rows are { vehicle, totalCost, distance } with all-time values.
// Vehicles with no distance are left out; the rest are sorted by cost per km, highest first.
export function rankByCostPerKm(rows) {
  return rows
    .filter((row) => row.distance > 0)
    .map((row) => ({ ...row, costPerKm: getCostPerKm(row.totalCost, row.distance) }))
    .sort((a, b) => b.costPerKm - a.costPerKm);
}
