import express from 'express';
import { ChatMessage } from '../models/ChatMessage.js';
import { Donation } from '../models/Donation.js';
import { DonorProfile } from '../models/DonorProfile.js';
import { NGOProfile } from '../models/NGOProfile.js';
import { VehicleBooking } from '../models/VehicleBooking.js';
import { Vehicle } from '../models/Vehicle.js';
import { Delivery } from '../models/Delivery.js';
import { Payment } from '../models/Payment.js';
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
      status: { $in: ['VALIDATED', 'MATCHING', 'NGO_NOTIFIED', 'NGO_ACCEPTED', 'SUBMITTED', 'VEHICLE_ASSIGNED', 'PICKUP_IN_PROGRESS', 'FOOD_COLLECTED', 'IN_TRANSIT'] }
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

// 4. Discover nearest Charity Food Rescue Trucks & Vans
communicationRouter.get('/nearby-charity-trucks', authenticate, async (req, res, next) => {
  try {
    const { lat, lng } = req.query;
    const targetLat = parseFloat(lat) || 12.9784; // Bengaluru center
    const targetLng = parseFloat(lng) || 77.6412;

    const allVehicles = await Vehicle.find({ isActive: true });

    const ranked = allVehicles.map((v) => {
      const vCoords = v.currentLocation?.coordinates || [77.6245, 12.9352];
      const dist = calculateDistanceKm(targetLat, targetLng, vCoords[1], vCoords[0]);
      const etaMins = Math.max(8, Math.round(dist * 3.5 + 4));

      return {
        id: v._id,
        registrationNumber: v.registrationNumber,
        driverName: v.driverName,
        driverPhone: v.driverPhone,
        vehicleType: v.vehicleType,
        providerType: v.providerType,
        capacityKg: v.capacityKg,
        hasCooling: v.hasCooling,
        distanceKm: Math.round(dist * 10) / 10,
        eta: `${etaMins} mins`,
        cost: 'Free (Charity Fleet)'
      };
    }).sort((a, b) => a.distanceKm - b.distanceKm);

    res.status(200).json({
      success: true,
      data: { trucks: ranked }
    });
  } catch (err) {
    next(err);
  }
});

// 5. Dispatch Dedicated Charity Truck or Express Transport for a donation
communicationRouter.post('/dispatch-charity-truck', authenticate, async (req, res, next) => {
  try {
    const { donationId, vehicleId } = req.body;
    const donation = await Donation.findById(donationId);
    if (!donation) {
      return res.status(404).json({ success: false, message: 'Donation not found' });
    }

    // Locate requested charity vehicle or nearest available charity truck
    let vehicle = null;
    if (vehicleId) {
      vehicle = await Vehicle.findById(vehicleId);
    }
    if (!vehicle) {
      vehicle = await Vehicle.findOne({ providerType: 'INTERNAL_NGO', isActive: true }) ||
                await Vehicle.findOne({ isActive: true });
    }

    if (!vehicle) {
      return res.status(400).json({ success: false, message: 'No active charity rescue trucks available currently.' });
    }

    // Generate pickup and drop OTPs
    const pickupOtp = generateOtp();
    const deliveryOtp = generateOtp();

    // Create booking record
    const bookingRef = `TRUCK-CHARITY-${Date.now().toString().slice(-6)}`;
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
    } else {
      delivery.vehicleId = vehicle._id;
      delivery.pickupOtpHash = hashOtp(pickupOtp);
      delivery.deliveryOtpHash = hashOtp(deliveryOtp);
      delivery.status = 'ASSIGNED';
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

    // Subsidy: 100% Free for NGO, funded by Donor Charity Fund Pool if authorized partner or zero-rated charity fleet
    const fareInRupees = vehicle.providerType === 'AUTHORIZED_PARTNER' ? 185 : 0;
    const fareInPaise = fareInRupees * 100;
    
    // Check total captured funds in charity pool
    const capturedPayments = await Payment.find({ status: 'CAPTURED' });
    const totalPoolPaise = capturedPayments.reduce((acc, p) => acc + (p.amountInPaise || 0), 0);
    const updatedPoolBalanceRupees = Math.max(0, (totalPoolPaise - fareInPaise) / 100);

    if (fareInPaise > 0) {
      await Payment.create({
        donorId: req.user._id,
        razorpayOrderId: `charity_debit_${Date.now()}`,
        razorpayPaymentId: `debit_settled_${Date.now()}`,
        amountInPaise: -fareInPaise,
        currency: 'INR',
        status: 'CAPTURED',
        taxExemption80GRequested: false,
        panNumber: 'FOODBRIDGE_POOL'
      });
    }

    res.status(200).json({
      success: true,
      message: `${vehicle.driverName} dispatched to donor kitchen! Free transport sponsored by Charity Fleet.`,
      data: {
        bookingReference: bookingRef,
        driverName: vehicle.driverName,
        driverPhone: vehicle.driverPhone,
        plate: vehicle.registrationNumber,
        vehicleType: vehicle.vehicleType,
        hasCooling: vehicle.hasCooling,
        capacityKg: vehicle.capacityKg,
        pickupOtp,
        deliveryOtp,
        pickupEta: '12-15 mins',
        estimatedFare: '100% FREE (NGO Charity Fleet)',
        charityFundBalance: `₹${updatedPoolBalanceRupees.toLocaleString('en-IN')}`
      }
    });
  } catch (err) {
    next(err);
  }
});

// Backward compatibility alias for /book-uber
communicationRouter.post('/book-uber', authenticate, async (req, res, next) => {
  req.url = '/dispatch-charity-truck';
  return communicationRouter.handle(req, res, next);
});
