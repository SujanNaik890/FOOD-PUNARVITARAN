import { User } from '../models/User.js';
import { hashPassword } from '../utils/crypto.js';
import { logger } from '../utils/logger.js';

export const seedDefaultAdmin = async () => {
  try {
    const defaultEmail = 'admin@foodbridge.org';
    const existing = await User.findOne({ email: defaultEmail });
    if (!existing) {
      const passwordHash = await hashPassword('Admin@12345');
      await User.create({
        name: 'Platform Administrator',
        email: defaultEmail,
        phone: '9999999999',
        passwordHash,
        role: 'ADMIN',
        status: 'ACTIVE'
      });
      logger.info(`Default admin seeded successfully: ${defaultEmail} / Admin@12345`);
    }
  } catch (err) {
    logger.warn(`Failed to seed default admin: ${err.message}`);
  }
};
