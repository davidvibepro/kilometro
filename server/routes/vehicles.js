import express from 'express';
import Expense from '../models/Expense.js';
import FuelLog from '../models/FuelLog.js';
import Owner from '../models/Owner.js';
import ServiceLog from '../models/ServiceLog.js';
import ServiceType from '../models/ServiceType.js';
import Vehicle, { VEHICLE_STATUSES } from '../models/Vehicle.js';
import { getCurrentOdometer } from '../services/odometer.js';
import { getRegistrationMonthName } from '../services/registration.js';
import { buildServiceSchedule } from '../services/schedule.js';

const router = express.Router();

// D11: the status changes that are allowed. A retired vehicle stays retired.
const ALLOWED_STATUS_CHANGES = {
  active: ['in_shop', 'retired'],
  in_shop: ['active', 'retired'],
  retired: [],
};

// Only these fields can be set from a request body.
// `status` is left out on purpose: it only changes through PATCH /:id/status (D11).
function pickVehicleFields(body = {}) {
  const { owner, plateNumber, make, model, year, type, fuelType, startingOdometer } = body;
  return { owner, plateNumber, make, model, year, type, fuelType, startingOdometer };
}

// Checks the schema rules first, then that the owner really exists
async function validateVehicle(vehicle) {
  await vehicle.validate();
  if (!(await Owner.exists({ _id: vehicle.owner }))) {
    const error = new Error('owner does not exist');
    error.status = 400;
    throw error;
  }
}

// GET /api/vehicles?type=&status=&owner=  (D17)
// An invalid owner id makes Mongoose throw a CastError, which errorHandler turns into 400
router.get('/', async (req, res) => {
  const { type, status, owner } = req.query;
  const filter = {};
  if (type) filter.type = type;
  if (status) filter.status = status;
  if (owner) filter.owner = owner;

  const vehicles = await Vehicle.find(filter).populate('owner', 'fullName').sort({ plateNumber: 1 });
  res.json(vehicles);
});

// GET /api/vehicles/:id  (D18: owner populated, plus currentOdometer and registrationMonth)
router.get('/:id', async (req, res) => {
  const vehicle = await Vehicle.findById(req.params.id).populate('owner');
  if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });

  res.json({
    ...vehicle.toObject(),
    currentOdometer: await getCurrentOdometer(vehicle),
    registrationMonth: getRegistrationMonthName(vehicle.plateNumber),
  });
});

// POST /api/vehicles
router.post('/', async (req, res) => {
  const vehicle = new Vehicle(pickVehicleFields(req.body));
  await validateVehicle(vehicle);
  await vehicle.save();
  res.status(201).json(vehicle);
});

// PUT /api/vehicles/:id  (D11: `status` in the body is ignored)
router.put('/:id', async (req, res) => {
  const vehicle = await Vehicle.findById(req.params.id);
  if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });

  vehicle.set(pickVehicleFields(req.body));
  await validateVehicle(vehicle);
  await vehicle.save();
  res.json(vehicle);
});

// DELETE /api/vehicles/:id  (D12: its service logs, fuel logs and expenses go too)
router.delete('/:id', async (req, res) => {
  const vehicle = await Vehicle.findById(req.params.id);
  if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });

  const [serviceLogs, fuelLogs, expenses] = await Promise.all([
    ServiceLog.deleteMany({ vehicle: vehicle._id }),
    FuelLog.deleteMany({ vehicle: vehicle._id }),
    Expense.deleteMany({ vehicle: vehicle._id }),
  ]);
  await vehicle.deleteOne();

  res.json({
    message: `Vehicle deleted, along with ${serviceLogs.deletedCount} service log(s), ${fuelLogs.deletedCount} fuel log(s) and ${expenses.deletedCount} expense(s)`,
  });
});

// PATCH /api/vehicles/:id/status  body: { "status": "in_shop" }  (D11)
router.patch('/:id/status', async (req, res) => {
  const { status } = req.body ?? {};
  const vehicle = await Vehicle.findById(req.params.id);
  if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });

  if (!VEHICLE_STATUSES.includes(status)) {
    return res.status(400).json({ message: `status must be one of: ${VEHICLE_STATUSES.join(', ')}` });
  }
  if (status === vehicle.status) {
    return res.status(400).json({ message: `Vehicle is already ${status}` });
  }
  if (!ALLOWED_STATUS_CHANGES[vehicle.status].includes(status)) {
    return res.status(400).json({
      message: `Status cannot change from ${vehicle.status} to ${status}: a retired vehicle stays retired`,
    });
  }

  vehicle.status = status;
  await vehicle.save();
  res.json(vehicle);
});

// GET /api/vehicles/:id/service-schedule  (D6)
// The database work happens here; the rule itself is the pure buildServiceSchedule()
router.get('/:id/service-schedule', async (req, res) => {
  const vehicle = await Vehicle.findById(req.params.id);
  if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });

  const [serviceTypes, serviceLogs, currentOdometer] = await Promise.all([
    ServiceType.find().sort({ name: 1 }),
    ServiceLog.find({ vehicle: vehicle._id }),
    getCurrentOdometer(vehicle),
  ]);

  res.json({
    currentOdometer,
    items: buildServiceSchedule(vehicle, serviceTypes, serviceLogs, currentOdometer),
  });
});

export default router;
