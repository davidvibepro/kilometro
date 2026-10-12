import mongoose from 'mongoose';
import { isNotInFuture } from '../services/dates.js';

// The odometer rule (D5) needs the vehicle's other logs, so it is checked
// in routes/fuelLogs.js with services/odometer.js, not here.
const fuelLogSchema = new mongoose.Schema(
  {
    vehicle: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', required: true },
    // D14: a fill-up cannot be dated in the future
    date: {
      type: Date,
      required: true,
      validate: { validator: isNotInFuture, message: 'date cannot be in the future' },
    },
    odometer: { type: Number, required: true },
    // Required by D19: fuel efficiency (D8) and costs (D9) need them
    liters: { type: Number, required: true, min: 0.1, max: 200 },
    pricePerLiter: { type: Number, required: true, min: 1 },
    fullTank: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model('FuelLog', fuelLogSchema);
