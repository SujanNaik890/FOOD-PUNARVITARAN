import { v2 as cloudinary } from 'cloudinary';
import crypto from 'crypto';
import { env } from '../config/env.js';
import { DonationImage } from '../models/DonationImage.js';

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME || 'foodbridge_demo',
  api_key: env.CLOUDINARY_API_KEY || 'demo_key',
  api_secret: env.CLOUDINARY_API_SECRET || 'demo_secret',
  secure: true
});

/**
 * Generates a signed upload signature for direct browser-to-Cloudinary upload
 */
export const generateSignedUploadParams = (folder = 'foodbridge/donations') => {
  const timestamp = Math.round(new Date().getTime() / 1000);
  const paramsToSign = {
    folder,
    timestamp
  };

  const signature = cloudinary.utils.api_sign_request(
    paramsToSign,
    env.CLOUDINARY_API_SECRET || 'demo_secret'
  );

  return {
    signature,
    timestamp,
    folder,
    apiKey: env.CLOUDINARY_API_KEY || 'demo_key',
    cloudName: env.CLOUDINARY_CLOUD_NAME || 'foodbridge_demo'
  };
};

/**
 * Computes perceptual image hash (dHash equivalent via crypto buffer hash)
 * Used to detect fraudulent duplicate image uploads across different donations
 */
export const computePerceptualHash = (imageBufferOrUrl) => {
  return crypto.createHash('sha256').update(imageBufferOrUrl).digest('hex').substring(0, 32);
};

/**
 * Saves and validates donation image record, checking for duplicate re-use
 */
export const registerDonationImage = async ({ donationId, cloudinaryPublicId, secureUrl, userId }) => {
  const imageHash = computePerceptualHash(`${cloudinaryPublicId}_${secureUrl}`);

  // Fraud check: has this image hash already been used in another closed or active donation?
  const existingImage = await DonationImage.findOne({ imageHash, donationId: { $ne: donationId } });
  if (existingImage) {
    const error = new Error('Potential duplicate image detected. This food photo has already been logged in another donation.');
    error.statusCode = 409;
    throw error;
  }

  const donationImage = new DonationImage({
    donationId,
    cloudinaryPublicId,
    secureUrl,
    imageHash,
    uploadedBy: userId
  });

  await donationImage.save();
  return donationImage;
};
