import FuelLog from '../models/FuelLog.js';
import ServiceLog from '../models/ServiceLog.js';

function badRequest(message) {
  const error = new Error(message);
  error.status = 400; // errorHandler sends it as 400 { message }
  return error;
}

// All fuel logs and service logs of a vehicle, as { date, odometer }
async function getVehicleReadings(vehicleId, excludeLogId) {
  const filter = { vehicle: vehicleId };
  if (excludeLogId) filter._id = { $ne: excludeLogId };

  const [fuelLogs, serviceLogs] = await Promise.all([
    FuelLog.find(filter).select('date odometer'),
    ServiceLog.find(filter).select('date odometer'),
  ]);
  return [...fuelLogs, ...serviceLogs];
}

// D4: the highest reading among the vehicle's fuel and service logs,
// or its startingOdometer when it has no logs yet
export async function getCurrentOdometer(vehicle) {
  const readings = await getVehicleReadings(vehicle._id);
  if (readings.length === 0) return vehicle.startingOdometer;
  return Math.max(...readings.map((log) => log.odometer));
}

// D5 (pure): the lowest and highest reading allowed for a log on `date`.
// It must be >= every reading dated before it (and >= startingOdometer),
// and <= every reading dated after it. Logs on the same date are not compared.
export function getAllowedOdometerRange(readings, date, startingOdometer) {
  const before = readings.filter((log) => log.date < date).map((log) => log.odometer);
  const after = readings.filter((log) => log.date > date).map((log) => log.odometer);

  return {
    min: Math.max(startingOdometer, ...before),
    max: after.length > 0 ? Math.min(...after) : null, // null = no upper limit
  };
}

// D5: throws a 400 error when a new or edited log breaks the odometer rule.
// On PUT, pass the id of the log being edited so it is not compared with itself.
export async function checkOdometerRule(vehicle, date, odometer, excludeLogId = null) {
  if (vehicle.status === 'retired') {
    throw badRequest('This vehicle is retired, so its logs cannot be added or changed');
  }

  const readings = await getVehicleReadings(vehicle._id, excludeLogId);
  const { min, max } = getAllowedOdometerRange(readings, date, vehicle.startingOdometer);

  if (max === null && odometer < min) {
    throw badRequest(`odometer must be at least ${min} km for this date`);
  }
  if (max !== null && (odometer < min || odometer > max)) {
    throw badRequest(`odometer must be between ${min} and ${max} km for this date`);
  }
}
