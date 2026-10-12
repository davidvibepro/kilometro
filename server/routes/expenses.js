import express from 'express';
import Expense from '../models/Expense.js';
import Vehicle from '../models/Vehicle.js';

const router = express.Router();

// Only these fields can be set from a request body
function pickExpenseFields(body = {}) {
  const { vehicle, date, category, amount } = body;
  return { vehicle, date, category, amount };
}

// Schema rules first (including D14: no future dates), then that the vehicle exists
async function validateExpense(expense) {
  await expense.validate();
  if (!(await Vehicle.exists({ _id: expense.vehicle }))) {
    const error = new Error('vehicle does not exist');
    error.status = 400;
    throw error;
  }
}

// GET /api/expenses?vehicle=&category=  (D17)
router.get('/', async (req, res) => {
  const { vehicle, category } = req.query;
  const filter = {};
  if (vehicle) filter.vehicle = vehicle;
  if (category) filter.category = category;

  const expenses = await Expense.find(filter)
    .populate('vehicle', 'plateNumber make model')
    .sort({ date: -1 });
  res.json(expenses);
});

// POST /api/expenses
router.post('/', async (req, res) => {
  const expense = new Expense(pickExpenseFields(req.body));
  await validateExpense(expense);
  await expense.save();
  res.status(201).json(expense);
});

// PUT /api/expenses/:id
router.put('/:id', async (req, res) => {
  const expense = await Expense.findById(req.params.id);
  if (!expense) return res.status(404).json({ message: 'Expense not found' });

  expense.set(pickExpenseFields(req.body));
  await validateExpense(expense);
  await expense.save();
  res.json(expense);
});

// DELETE /api/expenses/:id
router.delete('/:id', async (req, res) => {
  const expense = await Expense.findById(req.params.id);
  if (!expense) return res.status(404).json({ message: 'Expense not found' });

  await expense.deleteOne();
  res.json({ message: 'Expense deleted' });
});

export default router;
