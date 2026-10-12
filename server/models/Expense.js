import mongoose from 'mongoose';
import { isNotInFuture } from '../services/dates.js';

export const EXPENSE_CATEGORIES = ['registration', 'insurance', 'parts', 'parking', 'toll', 'wash', 'other'];

const expenseSchema = new mongoose.Schema(
  {
    vehicle: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', required: true },
    // D14: an expense cannot be dated in the future
    date: {
      type: Date,
      required: true,
      validate: { validator: isNotInFuture, message: 'date cannot be in the future' },
    },
    // Required by D19: the cost report (D9) needs them
    category: { type: String, required: true, enum: EXPENSE_CATEGORIES },
    amount: { type: Number, required: true, min: 0 },
  },
  { timestamps: true }
);

export default mongoose.model('Expense', expenseSchema);
