import express from 'express';
import FuelLog from '../models/FuelLog.js';
import Vehicle from '../models/Vehicle.js';
import { checkOdometerRule } from '../services/odometer.js';

const router = express.Router();

function badRequest(message) {
  const error = new Error(message);
  error.status = 400; // errorHandler sends it as 400 { message }
  return error;
}

// Only these fields can be set from a request body
function pickFuelLogFields(body = {}) {
  const { vehicle, date, odometer, liters, pricePerLiter, fullTank } = body;
  return { vehicle, date, odometer, liters, pricePerLiter, fullTank };
}

// Schema rules first (including D14: no future dates), then the vehicle and the odometer rule
async function validateFuelLog(fuelLog) {
  await fuelLog.validate();

  const vehicle = await Vehicle.findById(fuelLog.vehicle);
  if (!vehicle) throw badRequest('vehicle does not exist');

  // D5: odometer order and retired vehicles. A log being edited is not compared with itself.
  const excludeLogId = fuelLog.isNew ? null : fuelLog._id;
  await checkOdometerRule(vehicle, fuelLog.date, fuelLog.odometer, excludeLogId);
}

// GET /api/fuel-logs?vehicle=  (D17; without ?vehicle= it returns every fill-up)
router.get('/', async (req, res) => {
  const filter = {};
  if (req.query.vehicle) filter.vehicle = req.query.vehicle;

  const fuelLogs = await FuelLog.find(filter)
    .populate('vehicle', 'plateNumber make model')
    .sort({ date: -1, odometer: -1 });
  res.json(fuelLogs);
});

// GET /api/fuel-logs/:id
router.get('/:id', async (req, res) => {
  const fuelLog = await FuelLog.findById(req.params.id).populate('vehicle', 'plateNumber make model');
  if (!fuelLog) return res.status(404).json({ message: 'Fuel log not found' });
  res.json(fuelLog);
});

// POST /api/fuel-logs
router.post('/', async (req, res) => {
  const fuelLog = new FuelLog(pickFuelLogFields(req.body));
  await validateFuelLog(fuelLog);
  await fuelLog.save();
  res.status(201).json(fuelLog);
});

// PUT /api/fuel-logs/:id
router.put('/:id', async (req, res) => {
  const fuelLog = await FuelLog.findById(req.params.id);
  if (!fuelLog) return res.status(404).json({ message: 'Fuel log not found' });

  fuelLog.set(pickFuelLogFields(req.body));
  await validateFuelLog(fuelLog);
  await fuelLog.save();
  res.json(fuelLog);
});

// DELETE /api/fuel-logs/:id
router.delete('/:id', async (req, res) => {
  const fuelLog = await FuelLog.findById(req.params.id);
  if (!fuelLog) return res.status(404).json({ message: 'Fuel log not found' });

  await fuelLog.deleteOne();
  res.json({ message: 'Fuel log deleted' });
});

export default router;
