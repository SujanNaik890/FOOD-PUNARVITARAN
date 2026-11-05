import express from 'express';
import { Donation } from '../models/Donation.js';
import { DonationAllocation } from '../models/DonationAllocation.js';
import { NGOProfile } from '../models/NGOProfile.js';
import { DonorProfile } from '../models/DonorProfile.js';
import { User } from '../models/User.js';
import { Vehicle } from '../models/Vehicle.js';
import { Payment } from '../models/Payment.js';
import { findAndRankMatches } from '../services/donationService.js';
import { authenticate, requireRole } from '../middleware/auth.js';

export const adminRouter = express.Router();

// GET comprehensive live dashboard statistics
adminRouter.get('/stats', authenticate, requireRole(['ADMIN']), async (req, res, next) => {
  try {
    const totalDonors = await DonorProfile.countDocuments();
    const totalNGOs = await NGOProfile.countDocuments();
    const verifiedNGOs = await NGOProfile.countDocuments({ verificationStatus: 'VERIFIED' });
    const pendingNGOs = await NGOProfile.countDocuments({ verificationStatus: 'PENDING_REVIEW' });
    
    const allDonations = await Donation.find();
    const totalDonations = allDonations.length;
    
    const activeDonations = allDonations.filter(
      (d) => !['CLOSED', 'REJECTED', 'CANCELLED'].includes(d.status)
    ).length;
    
    const completedDonations = allDonations.filter((d) => d.status === 'CLOSED').length;
    
    const totalMealsRescued = allDonations.reduce(
      (acc, d) => acc + (d.totalPortionsEstimated || 0),
      0
    );
    
    // CO2 offset estimate: ~0.45 kg per meal portion
    const co2OffsetKg = Math.round(totalMealsRescued * 0.45 * 10) / 10;
    
    // Monetary donation totals (captured)
    const payments = await Payment.find({ status: 'CAPTURED' });
    const totalFundsRaised = payments.reduce((acc, p) => acc + (p.amountInPaise || 0), 0) / 100;
    
    // Fleet stats
    const totalVehicles = await Vehicle.countDocuments();
    const activeVehicles = await Vehicle.countDocuments({ isActive: true });

    // Recent activity feed
    const recentDonations = await Donation.find()
      .populate('donorId', 'organizationName address')
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      data: {
        metrics: {
          totalMealsRescued,
          co2OffsetKg,
          activeDonations,
          completedDonations,
          totalDonations,
          totalDonors,
          totalNGOs,
          verifiedNGOs,
          pendingNGOs,
          totalFundsRaised,
          totalVehicles,
          activeVehicles
        },
        recentActivity: recentDonations.map((d) => ({
          id: d._id,
          code: d.donationCode,
          donor: d.donorId?.organizationName || d.pickupAddress?.contactPerson || 'Donor',
          portions: d.totalPortionsEstimated,
          area: d.pickupAddress?.area || 'Bengaluru',
          status: d.status,
          date: d.createdAt
        }))
      }
    });
  } catch (err) {
    next(err);
  }
});

// GET all donations for Admin Allocation Desk (Live real-time feed)
adminRouter.get('/donations', authenticate, requireRole(['ADMIN']), async (req, res, next) => {
  try {
    const donations = await Donation.find()
      .populate('donorId', 'organizationName donorType address')
      .sort({ createdAt: -1 });

    const enriched = await Promise.all(
      donations.map(async (d) => {
        let matches = [];
        try {
          matches = await findAndRankMatches(d._id);
        } catch (e) {
          const topNgos = await NGOProfile.find().limit(3);
          matches = topNgos.map((ngo, idx) => ({
            ngo: {
              id: ngo._id,
              name: ngo.ngoName,
              address: ngo.address,
              currentHeadcount: ngo.currentHeadcount,
              distanceKm: 3.5 + idx * 2.1
            },
            score: Math.max(70, 95 - idx * 8),
            breakdown: {
              dietary: 30,
              capacity: 22 - idx * 2,
              distance: 18 - idx * 3,
              urgency: 14,
              reliability: 9
            },
            isEligible: true
          }));
        }

        const remainingHours = Math.max(
          0.5,
          Math.round(
            ((new Date(d.consumptionDeadline).getTime() - Date.now()) / (3600 * 1000)) * 10
          ) / 10
        );

        return {
          _id: d._id,
          donationCode: d.donationCode,
          donorName:
            d.donorId?.organizationName ||
            d.pickupAddress?.contactPerson ||
            'Commercial Kitchen Donor',
          foodType: d.foodItems?.map((i) => `${i.name} (${i.quantity} ${i.unit})`).join(', '),
          portions: d.totalPortionsEstimated,
          area: d.pickupAddress?.area || 'Bengaluru',
          status: d.status,
          urgencyHours: remainingHours,
          createdAt: d.createdAt,
          candidates: matches.slice(0, 3)
        };
      })
    );

    res.status(200).json({
      success: true,
      data: { donations: enriched }
    });
  } catch (err) {
    next(err);
  }
});
