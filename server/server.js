// Must be the first import: it loads server/.env into process.env
// before app.js reads process.env.CLIENT_ORIGIN.
import 'dotenv/config';
import app from './app.js';
import { connectDB } from './config/db.js';

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error('MONGO_URI is missing. Copy server/.env.example to server/.env and fill it in.');
  process.exit(1);
}

try {
  await connectDB(MONGO_URI);
  // Express 5 passes a startup error (e.g. the port is already in use) to this callback
  app.listen(PORT, (error) => {
    if (error) {
      console.error(`Could not start the server on port ${PORT}: ${error.message}`);
      process.exit(1);
    }
    console.log(`Server listening on http://localhost:${PORT}`);
  });
} catch (error) {
  console.error(`Could not connect to MongoDB: ${error.message}`);
  process.exit(1);
}
