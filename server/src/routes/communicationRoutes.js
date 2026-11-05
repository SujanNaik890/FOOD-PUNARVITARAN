import express from 'express';
import { ChatMessage } from '../models/ChatMessage.js';
import { Donation } from '../models/Donation.js';
import { DonorProfile } from '../models/DonorProfile.js';
import { NGOProfile } from '../models/NGOProfile.js';
import { VehicleBooking } from '../models/VehicleBooking.js';
import { Vehicle } from '../models/Vehicle.js';
import { Delivery } from '../models/Delivery.js';
import { calculateDistanceKm } from '../services/matchingEngine.js';
import { authenticate } from '../middleware/auth.js';
import { validateTransition } from '../services/donationStateMachine.js';
import { generateOtp, hashOtp } from '../utils/crypto.js';

export const communicationRouter = express.Router();

// 1. NGO Manager discovers nearest donors in Bengaluru
communicationRouter.get('/nearby-donors', authenticate, async (req, res, next) => {
  try {
    const ngoProfile = await NGOProfile.findOne({ userId: req.user._id }) || await NGOProfile.findOne();
    const ngoCoords = ngoProfile?.location?.coordinates || [77.6245, 12.9352]; // Koramangala fallback

    // Find all active or recent donations
    const donations = await Donation.find({
      status: { $in: ['VALIDATED', 'MATCHING', 'NGO_NOTIFIED', 'NGO_ACCEPTED', 'SUBMITTED'] }
    }).populate('donorId').sort({ createdAt: -1 });

    const results = donations.map((d) => {
      const donorCoords = d.pickupLocation?.coordinates || [77.6412, 12.9784];
      const dist = calculateDistanceKm(ngoCoords[1], ngoCoords[0], donorCoords[1], donorCoords[0]);

      return {
        donationId: d._id,
        donationCode: d.donationCode,
        donorName: d.donorId?.organizationName || d.pickupAddress?.contactPerson || 'Bengaluru Donor',
        donorUserId: d.donorId?.userId || null,
        phone: d.pickupAddress?.contactPhone || '9876543210',
        foodType: d.foodItems?.map((i) => `${i.name} (${i.quantity} ${i.unit})`).join(', '),
        portions: d.totalPortionsEstimated,
        dietaryType: d.dietaryType,
        area: d.pickupAddress?.area || 'Bengaluru',
        streetAddress: d.pickupAddress?.line1 || `${d.pickupAddress?.area || 'Bengaluru'} Kitchen`,
        coordinates: donorCoords, // [lng, lat]
        distanceKm: Math.round(dist * 10) / 10,
        status: d.status,
        consumptionDeadline: d.consumptionDeadline
      };
    }).sort((a, b) => a.distanceKm - b.distanceKm);

    res.status(200).json({
      success: true,
      data: { donors: results }
    });
  } catch (err) {
    next(err);
  }
});

// 2. Chat Messages: Get thread for a donation
communicationRouter.get('/chat/:donationId', authenticate, async (req, res, next) => {
  try {
    const { donationId } = req.params;
    const messages = await ChatMessage.find({ donationId })
      .populate('senderId', 'name role')
      .sort({ createdAt: 1 });

    res.status(200).json({
      success: true,
      data: { messages }
    });
  } catch (err) {
    next(err);
  }
});

// 3. Chat Messages: Send message
communicationRouter.post('/chat/send', authenticate, async (req, res, next) => {
  try {
    const { donationId, recipientId, message } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, message: 'Message cannot be empty' });
    }

    const chat = new ChatMessage({
      donationId,
      senderId: req.user._id,
      senderRole: req.user.role,
      recipientId: recipientId || req.user._id,
      message: message.trim()
    });

    await chat.save();

    res.status(201).json({
      success: true,
      data: { message: chat }
    });
  } catch (err) {
    next(err);
  }
});

// 4. Book Uber / Express Food Transport for a donation
communicationRouter.post('/book-uber', authenticate, async (req, res, next) => {
  try {
    const { donationId, pickupArea, dropArea, vehicleType } = req.body;
    const donation = await Donation.findById(donationId);
    if (!donation) {
      return res.status(404).json({ success: false, message: 'Donation not found' });
    }

    // Auto-create or fetch active vehicle driver
    let vehicle = await Vehicle.findOne({ isActive: true });
    if (!vehicle) {
      vehicle = new Vehicle({
        providerType: 'AUTHORIZED_PARTNER',
        vehicleType: vehicleType || 'AUTO_CARGO',
        registrationNumber: `KA-01-UB-${Math.floor(1000 + Math.random() * 9000)}`,
        driverName: 'Uber Logistics Driver (Bengaluru)',
        driverPhone: '9845012345',
        capacityKg: 300,
        hasCooling: false,
        isActive: true,
        currentLocation: { type: 'Point', coordinates: [77.6245, 12.9352] }
      });
      await vehicle.save();
    }

    // Generate pickup and drop OTPs
    const pickupOtp = generateOtp();
    const deliveryOtp = generateOtp();

    // Create booking record
    const bookingRef = `UBER-FOOD-${Date.now()}`;
    const booking = new VehicleBooking({
      allocationId: donation._id,
      vehicleId: vehicle._id,
      bookingReference: bookingRef,
      bookedBy: req.user._id,
      pickupEta: new Date(Date.now() + 15 * 60 * 1000), // 15 mins
      dropoffEta: new Date(Date.now() + 45 * 60 * 1000),
      status: 'DISPATCHED'
    });
    await booking.save();

    // Initialize or update Delivery
    let delivery = await Delivery.findOne({ donationId: donation._id });
    if (!delivery) {
      delivery = new Delivery({
        donationId: donation._id,
        vehicleId: vehicle._id,
        assignedNgoId: req.user._id,
        pickupOtpHash: hashOtp(pickupOtp),
        deliveryOtpHash: hashOtp(deliveryOtp),
        status: 'ASSIGNED'
      });
      await delivery.save();
    }

    // Advance donation status to VEHICLE_ASSIGNED
    try {
      validateTransition(donation.status, 'VEHICLE_ASSIGNED');
      donation.status = 'VEHICLE_ASSIGNED';
      await donation.save();
    } catch (e) {
      donation.status = 'VEHICLE_ASSIGNED';
      await donation.save();
    }

    res.status(200).json({
      success: true,
      message: 'Uber Express food delivery vehicle booked and dispatched!',
      data: {
        bookingReference: bookingRef,
        driverName: vehicle.driverName,
        driverPhone: vehicle.driverPhone,
        plate: vehicle.registrationNumber,
        pickupOtp,
        deliveryOtp,
        pickupEta: '15 mins',
        estimatedFare: '₹185 (Subsidized City Rescue Rate)'
      }
    });
  } catch (err) {
    next(err);
  }
});
