import express from 'express';
import Owner from '../models/Owner.js';
import Vehicle from '../models/Vehicle.js';

const router = express.Router();

// Only these fields can be set from a request body
function pickOwnerFields(body = {}) {
  const { fullName, email, contactNumber, type } = body;
  return { fullName, email, contactNumber, type };
}

// GET /api/owners
router.get('/', async (req, res) => {
  const owners = await Owner.find().sort({ fullName: 1 });
  res.json(owners);
});

// GET /api/owners/:id
router.get('/:id', async (req, res) => {
  const owner = await Owner.findById(req.params.id);
  if (!owner) return res.status(404).json({ message: 'Owner not found' });
  res.json(owner);
});

// POST /api/owners
router.post('/', async (req, res) => {
  const owner = await Owner.create(pickOwnerFields(req.body));
  res.status(201).json(owner);
});

// PUT /api/owners/:id
// Loads, changes and saves the owner, so every schema rule runs again
router.put('/:id', async (req, res) => {
  const owner = await Owner.findById(req.params.id);
  if (!owner) return res.status(404).json({ message: 'Owner not found' });

  owner.set(pickOwnerFields(req.body));
  await owner.save();
  res.json(owner);
});

// DELETE /api/owners/:id
// D12: an owner who still has vehicles cannot be deleted
router.delete('/:id', async (req, res) => {
  const owner = await Owner.findById(req.params.id);
  if (!owner) return res.status(404).json({ message: 'Owner not found' });

  const vehicleCount = await Vehicle.countDocuments({ owner: owner._id });
  if (vehicleCount > 0) {
    return res.status(400).json({
      message: `This owner still has ${vehicleCount} vehicle(s). Delete them or move them to another owner first.`,
    });
  }

  await owner.deleteOne();
  res.json({ message: 'Owner deleted' });
});

export default router;
