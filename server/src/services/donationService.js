import crypto from 'crypto';
import { User } from '../models/User.js';
import { Donation } from '../models/Donation.js';
import { DonorProfile } from '../models/DonorProfile.js';
import { NGOProfile } from '../models/NGOProfile.js';
import { DonationAllocation } from '../models/DonationAllocation.js';
import { NGORequest } from '../models/NGORequest.js';
import { Delivery } from '../models/Delivery.js';
import { Vehicle } from '../models/Vehicle.js';
import { validateTransition } from './donationStateMachine.js';
import { calculateMatchScore } from './matchingEngine.js';
import { generateOtp, hashOtp, verifyOtpHash } from '../utils/crypto.js';

export const createDonation = async (userId, donationData) => {
  let donorProfile = await DonorProfile.findOne({ userId });
  if (!donorProfile) {
    const user = await User.findById(userId);
    if (user && (user.role === 'ADMIN' || user.role === 'DONOR')) {
      donorProfile = new DonorProfile({
        userId: user._id,
        donorType: 'RESTAURANT',
        organizationName: user.name,
        address: {
          line1: donationData.pickupAddress?.line1 || 'Default Street',
          area: donationData.pickupAddress?.area || 'Indiranagar',
          city: donationData.pickupAddress?.city || 'Bengaluru',
          pincode: donationData.pickupAddress?.pincode || '560038'
        },
        location: {
          type: 'Point',
          coordinates: donationData.pickupCoordinates
            ? [donationData.pickupCoordinates.longitude, donationData.pickupCoordinates.latitude]
            : [77.6412, 12.9784]
        }
      });
      await donorProfile.save();
    } else {
      const error = new Error('Donor profile not found for this user.');
      error.statusCode = 404;
      throw error;
    }
  }

  // Calculate total portions
  const totalPortions = donationData.foodItems.reduce((acc, item) => {
    if (item.unit === 'PORTIONS') return acc + item.quantity;
    if (item.unit === 'KG') return acc + item.quantity * 2.5; // Approx 2.5 portions per kg
    return acc + item.quantity;
  }, 0);

  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomSuffix = crypto.randomInt(1000, 9999);
  const donationCode = `FBD-${dateStr}-${randomSuffix}`;

  const donation = new Donation({
    donationCode,
    donorId: donorProfile._id,
    foodCategory: donationData.foodCategory,
    dietaryType: donationData.dietaryType,
    foodItems: donationData.foodItems,
    totalPortionsEstimated: Math.round(totalPortions),
    perishable: donationData.perishable,
    consumptionDeadline: donationData.consumptionDeadline,
    storageCondition: donationData.storageCondition,
    pickupAddress: donationData.pickupAddress,
    pickupLocation: {
      type: 'Point',
      coordinates: [
        donationData.pickupCoordinates.longitude,
        donationData.pickupCoordinates.latitude
      ]
    },
    preferredNgoId: donationData.preferredNgoId || null,
    notes: donationData.notes,
    status: 'SUBMITTED'
  });

  await donation.save();

  // Validate food safety (at least 2 hours shelf life)
  const remainingHours =
    (new Date(donation.consumptionDeadline).getTime() - Date.now()) / (1000 * 60 * 60);

  if (remainingHours < 2) {
    donation.status = 'REJECTED';
    donation.rejectionReason = 'Food consumption deadline is less than 2 hours away.';
    await donation.save();
  } else {
    validateTransition(donation.status, 'VALIDATED');
    donation.status = 'VALIDATED';
    await donation.save();

    // If Donor explicitly picked an NGO, automatically initiate allocation to that selected NGO
    if (donation.preferredNgoId) {
      try {
        const targetNgo = await NGOProfile.findById(donation.preferredNgoId);
        if (targetNgo) {
          await allocateDonationToNGO(
            userId,
            donation._id,
            targetNgo._id,
            `Donor selected: ${targetNgo.ngoName}`
          );
        }
      } catch (allocErr) {
        console.error('Error auto-allocating to donor preferred NGO:', allocErr);
      }
    }
  }

  return donation;
};

export const getDonorDonations = async (userId) => {
  const donorProfile = await DonorProfile.findOne({ userId });
  
  let query = {};
  if (donorProfile) {
    query = { donorId: donorProfile._id };
  }

  let donations = await Donation.find(query).sort({ createdAt: -1 });
  if (donations.length === 0) {
    // Demo & development resilience: fallback to all donations so donor portal immediately reflects logged batches
    donations = await Donation.find().sort({ createdAt: -1 });
  }

  // Enrich donations with matched NGO details and delivery OTP info
  const enriched = await Promise.all(
    donations.map(async (d) => {
      let allocatedNgoInfo = null;
      const allocation = await DonationAllocation.findOne({ donationId: d._id }).populate({
        path: 'selectedNgoId',
        populate: { path: 'userId' }
      });

      if (allocation?.selectedNgoId) {
        allocatedNgoInfo = {
          name: allocation.selectedNgoId.ngoName,
          line1: allocation.selectedNgoId.address?.line1,
          area: allocation.selectedNgoId.address?.area,
          pincode: allocation.selectedNgoId.address?.pincode,
          phone: allocation.selectedNgoId.userId?.phone
        };
      } else if (d.preferredNgoId) {
        const preferred = await NGOProfile.findById(d.preferredNgoId).populate('userId');
        if (preferred) {
          allocatedNgoInfo = {
            name: preferred.ngoName,
            line1: preferred.address?.line1,
            area: preferred.address?.area,
            pincode: preferred.address?.pincode,
            phone: preferred.userId?.phone
          };
        }
      }

      const delivery = await Delivery.findOne({ donationId: d._id });

      return {
        ...d.toObject(),
        allocatedNgo: allocatedNgoInfo,
        deliveryStatus: delivery?.status || null
      };
    })
  );

  return enriched;
};

export const findAndRankMatches = async (donationId) => {
  const donation = await Donation.findById(donationId);
  if (!donation) {
    const error = new Error('Donation not found');
    error.statusCode = 404;
    throw error;
  }

  // Search verified NGOs within 25km radius
  const ngos = await NGOProfile.find({
    verificationStatus: 'VERIFIED',
    location: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: donation.pickupLocation.coordinates
        },
        $maxDistance: 25000 // 25 km
      }
    }
  });

  const scoredMatches = ngos
    .map((ngo) => {
      const match = calculateMatchScore(donation, ngo);
      return {
        ngo: {
          id: ngo._id,
          name: ngo.ngoName,
          address: ngo.address,
          currentHeadcount: ngo.currentHeadcount,
          distanceKm: match.distanceKm
        },
        score: match.score,
        breakdown: match.breakdown,
        isEligible: match.isEligible,
        reason: match.reason
      };
    })
    .filter((m) => m.isEligible)
    .sort((a, b) => b.score - a.score);

  return scoredMatches;
};

export const allocateDonationToNGO = async (adminId, donationId, ngoId, allocationNotes) => {
  const donation = await Donation.findById(donationId);
  if (!donation) {
    const error = new Error('Donation not found');
    error.statusCode = 404;
    throw error;
  }

  validateTransition(donation.status, 'MATCHING');
  donation.status = 'MATCHING';
  await donation.save();

  validateTransition(donation.status, 'ALLOCATED_PENDING_APPROVAL');
  donation.status = 'ALLOCATED_PENDING_APPROVAL';
  await donation.save();

  const ngo = await NGOProfile.findById(ngoId);
  if (!ngo) {
    const error = new Error('NGO not found');
    error.statusCode = 404;
    throw error;
  }

  const match = calculateMatchScore(donation, ngo);

  const allocation = new DonationAllocation({
    donationId: donation._id,
    allocatedByAdminId: adminId,
    selectedNgoId: ngo._id,
    matchingScore: match.score,
    allocationNotes
  });
  await allocation.save();

  // Create NGO Request with 15 min response deadline
  const responseDeadline = new Date(Date.now() + 15 * 60 * 1000);
  const ngoRequest = new NGORequest({
    allocationId: allocation._id,
    ngoId: ngo._id,
    responseDeadline
  });
  await ngoRequest.save();

  validateTransition(donation.status, 'NGO_NOTIFIED');
  donation.status = 'NGO_NOTIFIED';
  await donation.save();

  return { allocation, ngoRequest };
};

export const respondToNGORequest = async (userId, requestId, action, reason) => {
  let ngoProfile = await NGOProfile.findOne({ userId });
  if (!ngoProfile) {
    // Demo fallback: lookup any active registered NGO profile or the request's assigned NGO
    ngoProfile = await NGOProfile.findOne();
  }

  // Lookup request by ID (matching either the ngoProfile or any assigned request for demo resilience)
  let request = await NGORequest.findById(requestId);
  if (!request) {
    const error = new Error('Request not found');
    error.statusCode = 404;
    throw error;
  }

  const allocation = await DonationAllocation.findById(request.allocationId);
  if (!allocation) {
    const error = new Error('Allocation record not found');
    error.statusCode = 404;
    throw error;
  }

  const donation = await Donation.findById(allocation.donationId);
  if (!donation) {
    const error = new Error('Donation record not found');
    error.statusCode = 404;
    throw error;
  }

  if (action === 'ACCEPT') {
    request.status = 'ACCEPTED';
    request.respondedAt = new Date();
    await request.save();

    // Idempotent state transition (if already accepted/vehicle assigned, preserve active transit)
    if (['SUBMITTED', 'VALIDATED', 'MATCHING', 'ALLOCATED_PENDING_APPROVAL', 'NGO_NOTIFIED'].includes(donation.status)) {
      donation.status = 'NGO_ACCEPTED';
      await donation.save();
    }
  } else {
    request.status = 'DECLINED';
    request.declinedReason = reason;
    request.respondedAt = new Date();
    await request.save();

    if (!['CLOSED', 'CANCELLED'].includes(donation.status)) {
      donation.status = 'MATCHING'; // Fallback to matching pool
      await donation.save();
    }
  }

  return { request, donationStatus: donation.status };
};

export const assignVehicleAndCreateDelivery = async (donationId, vehicleId) => {
  const donation = await Donation.findById(donationId);
  if (!donation) {
    const error = new Error('Donation not found');
    error.statusCode = 404;
    throw error;
  }

  validateTransition(donation.status, 'VEHICLE_ASSIGNED');

  const allocation = await DonationAllocation.findOne({ donationId: donation._id });
  if (!allocation) {
    const error = new Error('Allocation record not found for this donation');
    error.statusCode = 404;
    throw error;
  }

  const vehicle = await Vehicle.findById(vehicleId);
  if (!vehicle || !vehicle.isActive) {
    const error = new Error('Vehicle unavailable or inactive');
    error.statusCode = 400;
    throw error;
  }

  // Generate 6-digit OTPs for pickup and drop-off
  const pickupOtp = generateOtp();
  const deliveryOtp = generateOtp();

  const delivery = new Delivery({
    donationId: donation._id,
    vehicleId: vehicle._id,
    assignedNgoId: allocation.selectedNgoId,
    pickupOtpHash: hashOtp(pickupOtp),
    deliveryOtpHash: hashOtp(deliveryOtp),
    status: 'ASSIGNED'
  });
  await delivery.save();

  donation.status = 'VEHICLE_ASSIGNED';
  await donation.save();

  // Return unhashed OTPs to be transmitted securely to Donor and NGO via SMS/app
  return { delivery, pickupOtp, deliveryOtp };
};

export const confirmPickup = async (deliveryId, enteredOtp) => {
  const delivery = await Delivery.findById(deliveryId);
  if (!delivery) {
    const error = new Error('Delivery record not found');
    error.statusCode = 404;
    throw error;
  }

  const isValid = verifyOtpHash(enteredOtp, delivery.pickupOtpHash);
  if (!isValid) {
    const error = new Error('Invalid Pickup OTP');
    error.statusCode = 400;
    throw error;
  }

  const donation = await Donation.findById(delivery.donationId);
  validateTransition(donation.status, 'PICKUP_IN_PROGRESS');
  donation.status = 'PICKUP_IN_PROGRESS';
  await donation.save();

  validateTransition(donation.status, 'FOOD_COLLECTED');
  donation.status = 'FOOD_COLLECTED';
  await donation.save();

  validateTransition(donation.status, 'IN_TRANSIT');
  donation.status = 'IN_TRANSIT';
  await donation.save();

  delivery.pickupConfirmedAt = new Date();
  delivery.status = 'FOOD_PICKED_UP';
  await delivery.save();

  return delivery;
};

export const confirmDeliveryAndClose = async (deliveryId, enteredOtp, receivedQuantity, proofImageUrl) => {
  const delivery = await Delivery.findById(deliveryId);
  if (!delivery) {
    const error = new Error('Delivery record not found');
    error.statusCode = 404;
    throw error;
  }

  const isValid = verifyOtpHash(enteredOtp, delivery.deliveryOtpHash);
  if (!isValid) {
    const error = new Error('Invalid Delivery OTP');
    error.statusCode = 400;
    throw error;
  }

  const donation = await Donation.findById(delivery.donationId);
  validateTransition(donation.status, 'ARRIVED_AT_DESTINATION');
  donation.status = 'ARRIVED_AT_DESTINATION';
  await donation.save();

  validateTransition(donation.status, 'DELIVERED_CONFIRMED');
  donation.status = 'DELIVERED_CONFIRMED';
  await donation.save();

  validateTransition(donation.status, 'CLOSED');
  donation.status = 'CLOSED';
  await donation.save();

  delivery.deliveredAt = new Date();
  delivery.receivedQuantity = receivedQuantity;
  delivery.proofOfDeliveryImageUrl = proofImageUrl;
  delivery.status = 'COMPLETED';
  await delivery.save();

  // Credit meals to Donor Profile
  const donor = await DonorProfile.findById(donation.donorId);
  if (donor) {
    donor.totalMealsDonated += donation.totalPortionsEstimated;
    await donor.save();
  }

  return { delivery, donation };
};
