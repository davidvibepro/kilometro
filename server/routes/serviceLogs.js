import express from 'express';
import ServiceLog from '../models/ServiceLog.js';
import ServiceType from '../models/ServiceType.js';
import Vehicle from '../models/Vehicle.js';
import { checkOdometerRule } from '../services/odometer.js';

const router = express.Router();

function badRequest(message) {
  const error = new Error(message);
  error.status = 400; // errorHandler sends it as 400 { message }
  return error;
}

// Only these fields can be set from a request body
function pickServiceLogFields(body = {}) {
  const { vehicle, serviceType, date, odometer, cost, shop } = body;
  return { vehicle, serviceType, date, odometer, cost, shop };
}

// Schema rules first, then the rules that need other records
async function validateServiceLog(serviceLog) {
  await serviceLog.validate();

  const [vehicle, serviceType] = await Promise.all([
    Vehicle.findById(serviceLog.vehicle),
    ServiceType.findById(serviceLog.serviceType),
  ]);
  if (!vehicle) throw badRequest('vehicle does not exist');
  if (!serviceType) throw badRequest('serviceType does not exist');

  // D13: the service type must apply to this kind of vehicle
  if (!serviceType.appliesTo.includes(vehicle.type)) {
    throw badRequest(`${serviceType.name} does not apply to a ${vehicle.type}`);
  }

  // D5: odometer order and retired vehicles. A log being edited is not compared with itself.
  const excludeLogId = serviceLog.isNew ? null : serviceLog._id;
  await checkOdometerRule(vehicle, serviceLog.date, serviceLog.odometer, excludeLogId);
}

// GET /api/service-logs?vehicle=  (D17; without ?vehicle= it returns every log)
router.get('/', async (req, res) => {
  const filter = {};
  if (req.query.vehicle) filter.vehicle = req.query.vehicle;

  const serviceLogs = await ServiceLog.find(filter)
    .populate('vehicle', 'plateNumber make model')
    .populate('serviceType', 'name')
    .sort({ date: -1, odometer: -1 });
  res.json(serviceLogs);
});

// GET /api/service-logs/:id
router.get('/:id', async (req, res) => {
  const serviceLog = await ServiceLog.findById(req.params.id)
    .populate('vehicle', 'plateNumber make model')
    .populate('serviceType', 'name');
  if (!serviceLog) return res.status(404).json({ message: 'Service log not found' });
  res.json(serviceLog);
});

// POST /api/service-logs
router.post('/', async (req, res) => {
  const serviceLog = new ServiceLog(pickServiceLogFields(req.body));
  await validateServiceLog(serviceLog);
  await serviceLog.save();
  res.status(201).json(serviceLog);
});

// PUT /api/service-logs/:id
router.put('/:id', async (req, res) => {
  const serviceLog = await ServiceLog.findById(req.params.id);
  if (!serviceLog) return res.status(404).json({ message: 'Service log not found' });

  serviceLog.set(pickServiceLogFields(req.body));
  await validateServiceLog(serviceLog);
  await serviceLog.save();
  res.json(serviceLog);
});

// DELETE /api/service-logs/:id
router.delete('/:id', async (req, res) => {
  const serviceLog = await ServiceLog.findById(req.params.id);
  if (!serviceLog) return res.status(404).json({ message: 'Service log not found' });

  await serviceLog.deleteOne();
  res.json({ message: 'Service log deleted' });
});

export default router;
