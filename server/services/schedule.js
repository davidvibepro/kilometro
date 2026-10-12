import { addMonths, daysBetween, startOfDayUtc } from './dates.js';

const DUE_SOON_KM = 500;
const DUE_SOON_DAYS = 14;

// D6: overdue when a limit is reached, due soon when within 500 km or 14 days.
// A null value means that limit does not exist. The null checks matter: in JS, null <= 0 is true.
function getStatus(kmRemaining, daysRemaining) {
  const kmReached = kmRemaining !== null && kmRemaining <= 0;
  const dateReached = daysRemaining !== null && daysRemaining <= 0;
  if (kmReached || dateReached) return 'overdue';

  const kmSoon = kmRemaining !== null && kmRemaining <= DUE_SOON_KM;
  const dateSoon = daysRemaining !== null && daysRemaining <= DUE_SOON_DAYS;
  if (kmSoon || dateSoon) return 'due_soon';

  return 'ok';
}

// D6: when each service is next due for ONE vehicle.
// Pure function: it reads nothing from the database, everything is passed in.
//   vehicle         { type, startingOdometer, createdAt }
//   serviceTypes    all service types
//   serviceLogs     this vehicle's service logs (serviceType as an id, not populated)
//   currentOdometer from D4 (services/odometer.js)
export function buildServiceSchedule(vehicle, serviceTypes, serviceLogs, currentOdometer, today = new Date()) {
  const todayDate = startOfDayUtc(today);
  const applicableTypes = serviceTypes.filter((type) => type.appliesTo.includes(vehicle.type));

  return applicableTypes.map((type) => {
    // The most recent log of this type; on the same date, the higher odometer wins
    const logsOfType = serviceLogs.filter((log) => String(log.serviceType) === String(type._id));
    const lastLog = [...logsOfType].sort((a, b) => b.date - a.date || b.odometer - a.odometer)[0];

    // With no log yet, count from the starting odometer and the day the vehicle was added
    const lastKm = lastLog ? lastLog.odometer : vehicle.startingOdometer;
    const lastDate = lastLog ? lastLog.date : startOfDayUtc(vehicle.createdAt);

    const nextDueKm = type.intervalKm > 0 ? lastKm + type.intervalKm : null;
    const nextDueDate = type.intervalMonths > 0 ? addMonths(lastDate, type.intervalMonths) : null;
    const kmRemaining = nextDueKm !== null ? nextDueKm - currentOdometer : null;
    const daysRemaining = nextDueDate !== null ? daysBetween(todayDate, nextDueDate) : null;

    return {
      serviceType: {
        _id: type._id,
        name: type.name,
        intervalKm: type.intervalKm,
        intervalMonths: type.intervalMonths,
      },
      lastServiceLogId: lastLog ? lastLog._id : null,
      lastKm,
      lastDate,
      nextDueKm,
      nextDueDate,
      kmRemaining,
      daysRemaining,
      status: getStatus(kmRemaining, daysRemaining),
    };
  });
}
