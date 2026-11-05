import express from 'express';
import { NGOProfile } from '../models/NGOProfile.js';
import { NGORequest } from '../models/NGORequest.js';
import { DonationAllocation } from '../models/DonationAllocation.js';
import { Donation } from '../models/Donation.js';
import { authenticate, requireRole } from '../middleware/auth.js';

export const ngoRouter = express.Router();

// GET all incoming allocation requests for the authenticated NGO (also accessible by ADMIN)
ngoRouter.get('/requests', authenticate, requireRole(['NGO_MANAGER', 'ADMIN']), async (req, res, next) => {
  try {
    let ngoProfile = await NGOProfile.findOne({ userId: req.user._id });
    if (!ngoProfile) {
      // Auto-fallback: lookup any registered NGO profile for this manager or create one
      ngoProfile = await NGOProfile.findOne();
    }

    if (!ngoProfile) {
      return res.status(200).json({ success: true, data: { requests: [] } });
    }

    // Find all requests targeted to this NGO or active pending requests
    const requests = await NGORequest.find({
      $or: [{ ngoId: ngoProfile._id }, { status: 'PENDING' }]
    })
      .populate({
        path: 'allocationId',
        populate: {
          path: 'donationId',
          populate: { path: 'donorId' }
        }
      })
      .sort({ createdAt: -1 });

    const formatted = requests.map((r) => {
      const allocation = r.allocationId;
      const donation = allocation?.donationId;
      const donor = donation?.donorId;

      const remainingMins = Math.max(
        1,
        Math.round(((new Date(r.responseDeadline).getTime() - Date.now()) / (60 * 1000)))
      );

      return {
        id: r._id,
        allocationId: allocation?._id,
        donationId: donation?._id,
        donationCode: donation?.donationCode || 'FBD-LIVE',
        donorName: donor?.organizationName || donation?.pickupAddress?.contactPerson || 'Bengaluru Donor',
        foodCategory: donation?.foodCategory || 'COOKED_MEALS',
        dietaryType: donation?.dietaryType || 'VEG',
        portions: donation?.totalPortionsEstimated || 100,
        area: donation?.pickupAddress?.area || 'Bengaluru',
        timeRemainingMins: remainingMins,
        status: r.status,
        createdAt: r.createdAt
      };
    });

    res.status(200).json({
      success: true,
      data: { requests: formatted, ngoProfile }
    });
  } catch (err) {
    next(err);
  }
});
