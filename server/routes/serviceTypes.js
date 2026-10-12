import express from 'express';
import ServiceLog from '../models/ServiceLog.js';
import ServiceType from '../models/ServiceType.js';

const router = express.Router();

// Only these fields can be set from a request body
function pickServiceTypeFields(body = {}) {
  const { name, intervalKm, intervalMonths, appliesTo } = body;
  return { name, intervalKm, intervalMonths, appliesTo };
}

// GET /api/service-types
router.get('/', async (req, res) => {
  const serviceTypes = await ServiceType.find().sort({ name: 1 });
  res.json(serviceTypes);
});

// POST /api/service-types
router.post('/', async (req, res) => {
  const serviceType = await ServiceType.create(pickServiceTypeFields(req.body));
  res.status(201).json(serviceType);
});

// PUT /api/service-types/:id
// save() runs the schema rules again, including "at least one interval"
router.put('/:id', async (req, res) => {
  const serviceType = await ServiceType.findById(req.params.id);
  if (!serviceType) return res.status(404).json({ message: 'Service type not found' });

  serviceType.set(pickServiceTypeFields(req.body));
  await serviceType.save();
  res.json(serviceType);
});

// DELETE /api/service-types/:id
// D12: a service type that is used by service logs cannot be deleted
router.delete('/:id', async (req, res) => {
  const serviceType = await ServiceType.findById(req.params.id);
  if (!serviceType) return res.status(404).json({ message: 'Service type not found' });

  const logCount = await ServiceLog.countDocuments({ serviceType: serviceType._id });
  if (logCount > 0) {
    return res.status(400).json({
      message: `This service type is used by ${logCount} service log(s), so it cannot be deleted.`,
    });
  }

  await serviceType.deleteOne();
  res.json({ message: 'Service type deleted' });
});

export default router;
