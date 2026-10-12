import express from 'express';
import Expense from '../models/Expense.js';
import FuelLog from '../models/FuelLog.js';
import ServiceLog from '../models/ServiceLog.js';
import ServiceType from '../models/ServiceType.js';
import Vehicle from '../models/Vehicle.js';
import { getCurrentMonthRange, isInRange, rankByCostPerKm, sumCosts } from '../services/costs.js';
import { getCurrentOdometer } from '../services/odometer.js';
import { buildServiceSchedule } from '../services/schedule.js';

const router = express.Router();

// D10: the service type with the most service logs, counted by MongoDB itself
async function findMostCommonService(serviceTypes) {
  const [top] = await ServiceLog.aggregate([
    { $group: { _id: '$serviceType', count: { $sum: 1 } } },
    { $sort: { count: -1, _id: 1 } },
    { $limit: 1 },
  ]);
  if (!top) return null;

  const serviceType = serviceTypes.find((type) => String(type._id) === String(top._id));
  return { serviceType: { _id: top._id, name: serviceType?.name }, count: top.count };
}

// GET /api/stats/fleet  (D10)
router.get('/fleet', async (req, res) => {
  const today = new Date();
  const [vehicles, serviceTypes, fuelLogs, serviceLogs, expenses] = await Promise.all([
    Vehicle.find(),
    ServiceType.find(),
    FuelLog.find(),
    ServiceLog.find(),
    Expense.find(),
  ]);

  // Spending this month: every record dated in the current calendar month
  const { from, to } = getCurrentMonthRange(today);
  const inThisMonth = (record) => isInRange(record.date, from, to);
  const spendingThisMonth = sumCosts(
    fuelLogs.filter(inThisMonth),
    serviceLogs.filter(inThisMonth),
    expenses.filter(inThisMonth)
  );

  const rankingRows = [];
  let overdueVehicles = 0;

  for (const vehicle of vehicles) {
    if (vehicle.status === 'retired') continue; // retired vehicles are in neither list

    const ofThisVehicle = (record) => String(record.vehicle) === String(vehicle._id);
    const vehicleServiceLogs = serviceLogs.filter(ofThisVehicle);
    const currentOdometer = await getCurrentOdometer(vehicle);

    // Ranking: all-time cost and all-time distance
    const allTimeCost = sumCosts(fuelLogs.filter(ofThisVehicle), vehicleServiceLogs, expenses.filter(ofThisVehicle));
    rankingRows.push({
      vehicle: {
        _id: vehicle._id,
        plateNumber: vehicle.plateNumber,
        make: vehicle.make,
        model: vehicle.model,
        status: vehicle.status,
      },
      totalCost: allTimeCost.total,
      distance: currentOdometer - vehicle.startingOdometer,
    });

    // Overdue count: active vehicles with at least one overdue service
    if (vehicle.status === 'active') {
      const schedule = buildServiceSchedule(vehicle, serviceTypes, vehicleServiceLogs, currentOdometer, today);
      if (schedule.some((item) => item.status === 'overdue')) overdueVehicles += 1;
    }
  }

  res.json({
    spendingThisMonth,
    ranking: rankByCostPerKm(rankingRows),
    mostCommonService: await findMostCommonService(serviceTypes),
    overdueVehicles,
  });
});

export default router;
