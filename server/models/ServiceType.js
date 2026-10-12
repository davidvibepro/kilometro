import mongoose from 'mongoose';
import { VEHICLE_TYPES } from './Vehicle.js';

const serviceTypeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    intervalKm: { type: Number, min: 0 },
    intervalMonths: { type: Number, min: 0, max: 60 },
    appliesTo: [{ type: String, enum: VEHICLE_TYPES }],
  },
  { timestamps: true }
);

// A service type needs at least one interval, otherwise it can never become due
serviceTypeSchema.pre('validate', function () {
  if (!(this.intervalKm > 0) && !(this.intervalMonths > 0)) {
    this.invalidate('intervalKm', 'intervalKm or intervalMonths must be greater than 0');
  }
});

export default mongoose.model('ServiceType', serviceTypeSchema);
