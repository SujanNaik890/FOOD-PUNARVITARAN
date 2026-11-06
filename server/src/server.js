import http from 'http';
import { app } from './app.js';
import { env } from './config/env.js';
import { connectDB } from './config/db.js';
import { logger } from './utils/logger.js';
import { seedDefaultAdmin } from './utils/seedAdmin.js';
import { seedBengaluruTrucks } from './utils/seedBengaluruFleet.js';

const server = http.createServer(app);

const startServer = async () => {
  try {
    // Connect to MongoDB Atlas or local MongoDB
    try {
      await connectDB();
      await seedDefaultAdmin();
      await seedBengaluruTrucks();
    } catch (dbErr) {
      logger.warn(`Could not connect to external MongoDB: ${dbErr.message}. Starting in offline testing mode.`);
    }

    server.listen(env.PORT, () => {
      logger.info(`FoodBridge REST API active on http://localhost:${env.PORT}`);
      logger.info(`Environment: ${env.NODE_ENV} | Region: Bengaluru, India`);
    });
  } catch (err) {
    logger.error(`Server startup failure: ${err.message}`);
    process.exit(1);
  }
};

startServer();
