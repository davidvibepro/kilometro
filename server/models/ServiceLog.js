import mongoose from 'mongoose';
import { isNotInFuture } from '../services/dates.js';

// The odometer rule (D5) and the service type check (D13) need other records,
// so they are checked in routes/serviceLogs.js, not here.
const serviceLogSchema = new mongoose.Schema(
  {
    vehicle: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', required: true },
    serviceType: { type: mongoose.Schema.Types.ObjectId, ref: 'ServiceType', required: true },
    date: {
      type: Date,
      required: true,
      validate: { validator: isNotInFuture, message: 'date cannot be in the future' },
    },
    odometer: { type: Number, required: true, min: 0 },
    cost: { type: Number, min: 0 },
    shop: { type: String, trim: true },
  },
  { timestamps: true }
);

export default mongoose.model('ServiceLog', serviceLogSchema);
