import express from 'express';
import { authenticate, requireRole } from '../middleware/auth.js';
import {
  generateSignedUploadParams,
  registerDonationImage
} from '../integrations/cloudinaryService.js';
import { calculateRouteMatrix } from '../integrations/routeService.js';

export const integrationRouter = express.Router();

// Cloudinary signature generator
integrationRouter.get('/cloudinary/signature', authenticate, (req, res) => {
  const params = generateSignedUploadParams();
  res.status(200).json({
    success: true,
    data: params
  });
});

// Register uploaded image
integrationRouter.post('/cloudinary/register-image', authenticate, async (req, res, next) => {
  try {
    const { donationId, cloudinaryPublicId, secureUrl } = req.body;
    const image = await registerDonationImage({
      donationId,
      cloudinaryPublicId,
      secureUrl,
      userId: req.user._id
    });

    res.status(201).json({
      success: true,
      message: 'Donation image registered and hash-verified',
      data: { image }
    });
  } catch (err) {
    next(err);
  }
});

// Route & Distance Calculator
integrationRouter.post('/routes/calculate', authenticate, async (req, res, next) => {
  try {
    const { originCoordinates, destinationCoordinates } = req.body;
    if (!originCoordinates || !destinationCoordinates) {
      return res.status(400).json({ success: false, message: 'Origin and destination coordinates required' });
    }

    const route = await calculateRouteMatrix(originCoordinates, destinationCoordinates);
    res.status(200).json({
      success: true,
      data: route
    });
  } catch (err) {
    next(err);
  }
});
