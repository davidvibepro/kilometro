import mongoose from 'mongoose';

// Opens the connection to MongoDB Atlas. The URI is never printed.
export async function connectDB(uri) {
  await mongoose.connect(uri);
  console.log(`MongoDB connected (database: ${mongoose.connection.name})`);
}
