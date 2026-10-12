import express from 'express';
import ServiceLog from '../models/ServiceLog.js';
import ServiceType from '../models/ServiceType.js';
import Vehicle from '../models/Vehicle.js';
import { getCurrentOdometer } from '../services/odometer.js';
import { getRegistrationMonthName, getRegistrationStatus } from '../services/registration.js';
import { buildServiceSchedule } from '../services/schedule.js';

const router = express.Router();

const DAYS_PER_MONTH = 30.44; // average length of a month

// D7: overdue services, then due-soon services, then registrations this month, then next month
const GROUP_ORDER = { overdue: 0, due_soon: 1, due_this_month: 2, due_next_month: 3 };

// D20: how much of the interval is left, e.g. 0.04 = 4% left, -0.1 = 10% past due.
// The km share and the date share are compared, and the smaller one counts.
function getShareLeft(item) {
  const shares = [];
  if (item.kmRemaining !== null) {
    shares.push(item.kmRemaining / item.serviceType.intervalKm);
  }
  if (item.daysRemaining !== null) {
    shares.push(item.daysRemaining / (item.serviceType.intervalMonths * DAYS_PER_MONTH));
  }
  return Math.round(Math.min(...shares) * 1000) / 1000;
}

function compareReminders(a, b) {
  if (a.status !== b.status) return GROUP_ORDER[a.status] - GROUP_ORDER[b.status];
  if (a.kind === 'service') return a.shareLeft - b.shareLeft; // lower = more urgent
  return 0;
}

// GET /api/reminders  (D7: active vehicles only)
router.get('/', async (req, res) => {
  const today = new Date();
  const [vehicles, serviceTypes] = await Promise.all([
    Vehicle.find({ status: 'active' }),
    ServiceType.find(),
  ]);

  const reminders = [];
  for (const vehicle of vehicles) {
    const vehicleInfo = {
      _id: vehicle._id,
      plateNumber: vehicle.plateNumber,
      make: vehicle.make,
      model: vehicle.model,
    };

    // Service items: the D6 schedule rows that are overdue or due soon
    const [serviceLogs, currentOdometer] = await Promise.all([
      ServiceLog.find({ vehicle: vehicle._id }),
      getCurrentOdometer(vehicle),
    ]);
    const schedule = buildServiceSchedule(vehicle, serviceTypes, serviceLogs, currentOdometer, today);
    for (const item of schedule) {
      if (item.status === 'ok') continue;
      reminders.push({
        kind: 'service',
        status: item.status,
        vehicle: vehicleInfo,
        serviceType: item.serviceType,
        nextDueKm: item.nextDueKm,
        nextDueDate: item.nextDueDate,
        kmRemaining: item.kmRemaining,
        daysRemaining: item.daysRemaining,
        shareLeft: getShareLeft(item),
      });
    }

    // Registration item: renewal this month or next month
    const registrationStatus = getRegistrationStatus(vehicle.plateNumber, today);
    if (registrationStatus) {
      reminders.push({
        kind: 'registration',
        status: registrationStatus,
        vehicle: vehicleInfo,
        registrationMonth: getRegistrationMonthName(vehicle.plateNumber),
      });
    }
  }

  reminders.sort(compareReminders);
  res.json(reminders);
});

export default router;
