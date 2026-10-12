import express from 'express';
import cors from 'cors';
import logger from './middleware/logger.js';
import notFound from './middleware/notFound.js';
import errorHandler from './middleware/errorHandler.js';
import vehicleRoutes from './routes/vehicles.js';
import ownerRoutes from './routes/owners.js';
import serviceTypeRoutes from './routes/serviceTypes.js';
import serviceLogRoutes from './routes/serviceLogs.js';
import fuelLogRoutes from './routes/fuelLogs.js';
import expenseRoutes from './routes/expenses.js';
import reminderRoutes from './routes/reminders.js';
import statsRoutes from './routes/stats.js';

const app = express();

// The order below matters (CLAUDE.md §6)
app.use(cors({ origin: process.env.CLIENT_ORIGIN }));
app.use(express.json());
app.use(logger);

app.use('/api/vehicles', vehicleRoutes);
app.use('/api/owners', ownerRoutes);
app.use('/api/service-types', serviceTypeRoutes);
app.use('/api/service-logs', serviceLogRoutes);
app.use('/api/fuel-logs', fuelLogRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/reminders', reminderRoutes);
app.use('/api/stats', statsRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
