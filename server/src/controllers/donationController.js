import {
  createDonation,
  getDonorDonations,
  findAndRankMatches,
  allocateDonationToNGO,
  respondToNGORequest,
  assignVehicleAndCreateDelivery,
  confirmPickup,
  confirmDeliveryAndClose
} from '../services/donationService.js';

export const createDonationHandler = async (req, res, next) => {
  try {
    const donation = await createDonation(req.user._id, req.validatedBody);
    res.status(201).json({
      success: true,
      message: 'Donation created and validated successfully',
      data: { donation }
    });
  } catch (error) {
    next(error);
  }
};

export const getMyDonationsHandler = async (req, res, next) => {
  try {
    const donations = await getDonorDonations(req.user._id);
    res.status(200).json({
      success: true,
      data: { donations }
    });
  } catch (error) {
    next(error);
  }
};

export const getMatchesHandler = async (req, res, next) => {
  try {
    const { donationId } = req.params;
    const matches = await findAndRankMatches(donationId);
    res.status(200).json({
      success: true,
      data: { matches }
    });
  } catch (error) {
    next(error);
  }
};

export const allocateHandler = async (req, res, next) => {
  try {
    const { donationId, selectedNgoId, allocationNotes } = req.validatedBody;
    const result = await allocateDonationToNGO(req.user._id, donationId, selectedNgoId, allocationNotes);
    res.status(200).json({
      success: true,
      message: 'Donation allocated and NGO notified',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

export const ngoResponseHandler = async (req, res, next) => {
  try {
    const { allocationId, action, reason } = req.validatedBody;
    const result = await respondToNGORequest(req.user._id, allocationId, action, reason);
    res.status(200).json({
      success: true,
      message: `Request ${action.toLowerCase()}ed successfully`,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

export const assignVehicleHandler = async (req, res, next) => {
  try {
    const { donationId, vehicleId } = req.body;
    const result = await assignVehicleAndCreateDelivery(donationId, vehicleId);
    res.status(200).json({
      success: true,
      message: 'Vehicle assigned and delivery initialized',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

export const confirmPickupHandler = async (req, res, next) => {
  try {
    const { deliveryId, otp } = req.body;
    const delivery = await confirmPickup(deliveryId, otp);
    res.status(200).json({
      success: true,
      message: 'Pickup confirmed. Food is now in transit.',
      data: { delivery }
    });
  } catch (error) {
    next(error);
  }
};

export const confirmDeliveryHandler = async (req, res, next) => {
  try {
    const { deliveryId, otp, receivedQuantity, proofImageUrl } = req.body;
    const result = await confirmDeliveryAndClose(deliveryId, otp, receivedQuantity, proofImageUrl);
    res.status(200).json({
      success: true,
      message: 'Delivery confirmed and donation closed.',
      data: result
    });
  } catch (error) {
    next(error);
  }
};
