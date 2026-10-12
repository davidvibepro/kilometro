const FLAG_BELOW = 0.85; // flagged when more than 15% below the average

function roundTo2(value) {
  return Math.round(value * 100) / 100;
}

// D8: kilometers per liter between full-tank fill-ups, for ONE vehicle.
// Pure function: pass in that vehicle's fuel logs.
export function computeFuelEfficiency(fuelLogs) {
  const sorted = [...fuelLogs].sort((a, b) => a.odometer - b.odometer);

  const entries = [];
  let previousFullTank = null;
  let litersSinceFullTank = 0;

  for (const log of sorted) {
    // Fill-ups before the first full tank are not counted
    if (previousFullTank) litersSinceFullTank += log.liters;
    if (!log.fullTank) continue;

    if (previousFullTank) {
      const distance = log.odometer - previousFullTank.odometer;
      entries.push({
        fuelLogId: log._id,
        date: log.date,
        odometer: log.odometer,
        kmPerLiter: roundTo2(distance / litersSinceFullTank),
      });
    }
    previousFullTank = log;
    litersSinceFullTank = 0;
  }

  if (entries.length === 0) {
    return { average: null, best: null, worst: null, entries: [], message: 'Need at least two full-tank fill-ups' };
  }

  const values = entries.map((entry) => entry.kmPerLiter);
  const average = roundTo2(values.reduce((sum, value) => sum + value, 0) / values.length);

  return {
    average,
    best: Math.max(...values),
    worst: Math.min(...values),
    entries: entries.map((entry) => ({ ...entry, flagged: entry.kmPerLiter < average * FLAG_BELOW })),
  };
}
