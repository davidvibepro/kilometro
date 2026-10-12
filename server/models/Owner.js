import mongoose from 'mongoose';

const ownerSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true },

    // Optional (D3). An empty email is stored as "no email" so the unique index skips it.
    email: {
      type: String,
      set: (value) => value?.trim() || undefined,
      unique: true,
      sparse: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'email must be a valid email address'],
    },

    // Philippine mobile number, e.g. 09171234567 (D2)
    contactNumber: {
      type: String,
      required: true,
      trim: true,
      match: [/^09\d{9}$/, 'contactNumber must be 11 digits starting with 09'],
    },

    type: { type: String, enum: ['individual', 'business'] },
  },
  { timestamps: true }
);

export default mongoose.model('Owner', ownerSchema);
