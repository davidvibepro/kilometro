import express from 'express';
import cors from 'cors';
import logger from './middleware/logger.js';
import notFound from './middleware/notFound.js';
import errorHandler from './middleware/errorHandler.js';

const app = express();

// The order below matters (CLAUDE.md §6)
app.use(cors({ origin: process.env.CLIENT_ORIGIN }));
app.use(express.json());
app.use(logger);

// Routes are mounted here (CP1.2)

app.use(notFound);
app.use(errorHandler);

export default app;
