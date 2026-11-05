import express from 'express';
import {
  CreateDonationSchema,
  AllocationApprovalSchema,
  NGOResponseSchema
} from '@foodbridge/shared';
import { authenticate, requireRole } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  createDonationHandler,
  getMyDonationsHandler,
  getMatchesHandler,
  allocateHandler,
  ngoResponseHandler,
  assignVehicleHandler,
  confirmPickupHandler,
  confirmDeliveryHandler
} from '../controllers/donationController.js';

export const donationRouter = express.Router();

// DONOR & ADMIN Routes
donationRouter.post(
  '/',
  authenticate,
  requireRole(['DONOR', 'ADMIN']),
  validate(CreateDonationSchema),
  createDonationHandler
);

donationRouter.get(
  '/my',
  authenticate,
  requireRole(['DONOR', 'ADMIN']),
  getMyDonationsHandler
);

// ADMIN Routes
donationRouter.get(
  '/:donationId/matches',
  authenticate,
  requireRole(['ADMIN']),
  getMatchesHandler
);

donationRouter.post(
  '/allocate',
  authenticate,
  requireRole(['ADMIN']),
  validate(AllocationApprovalSchema),
  allocateHandler
);

donationRouter.post(
  '/assign-vehicle',
  authenticate,
  requireRole(['ADMIN']),
  assignVehicleHandler
);

// NGO Routes
donationRouter.post(
  '/respond-request',
  authenticate,
  requireRole(['NGO_MANAGER', 'ADMIN']),
  validate(NGOResponseSchema),
  ngoResponseHandler
);

// LOGISTICS & OTP HANDOVER
donationRouter.post(
  '/delivery/confirm-pickup',
  authenticate,
  confirmPickupHandler
);

donationRouter.post(
  '/delivery/confirm-delivery',
  authenticate,
  requireRole(['NGO_MANAGER', 'ADMIN']),
  confirmDeliveryHandler
);
