import mongoose from 'mongoose';

export const VEHICLE_TYPES = ['motorcycle', 'car', 'suv', 'van', 'truck'];
export const FUEL_TYPES = ['gasoline', 'diesel'];
export const VEHICLE_STATUSES = ['active', 'in_shop', 'retired'];

const vehicleSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'Owner', required: true },

    // D1: saved trimmed and uppercase, 4 to 10 characters, with at least one digit
    plateNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
      minlength: 4,
      maxlength: 10,
      match: [
        /^[A-Z0-9]+([ -][A-Z0-9]+)*$/,
        'plateNumber may only contain letters and digits, separated by single spaces or dashes',
      ],
      validate: {
        validator: (value) => /\d/.test(value),
        message: 'plateNumber must contain at least one digit',
      },
    },

    make: { type: String, required: true, trim: true },
    model: { type: String, required: true, trim: true },

    // D15: the maximum is next year, worked out each time a vehicle is validated
    year: {
      type: Number,
      min: 1980,
      validate: {
        validator: (value) => value <= new Date().getFullYear() + 1,
        message: () => `year must be ${new Date().getFullYear() + 1} or earlier`,
      },
    },

    // Required by D19: the service schedule (D6) and odometer rule (D5) need them
    type: { type: String, required: true, enum: VEHICLE_TYPES },
    fuelType: { type: String, enum: FUEL_TYPES },
    startingOdometer: { type: Number, required: true, min: 0 },

    status: { type: String, enum: VEHICLE_STATUSES, default: 'active' },
  },
  { timestamps: true }
);

export default mongoose.model('Vehicle', vehicleSchema);
