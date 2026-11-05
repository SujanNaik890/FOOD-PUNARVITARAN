/**
 * Allowed State Transitions for Donation Lifecycle
 */
export const ALLOWED_TRANSITIONS = {
  DRAFT: ['SUBMITTED', 'CANCELLED'],
  SUBMITTED: ['VALIDATED', 'REJECTED', 'CANCELLED'],
  VALIDATED: ['MATCHING', 'CANCELLED'],
  REJECTED: [], // Terminal
  MATCHING: ['ALLOCATED_PENDING_APPROVAL', 'CANCELLED'],
  ALLOCATED_PENDING_APPROVAL: ['NGO_NOTIFIED', 'MATCHING', 'CANCELLED'],
  NGO_NOTIFIED: ['NGO_ACCEPTED', 'MATCHING'],
  NGO_ACCEPTED: ['VEHICLE_ASSIGNED', 'CANCELLED'],
  VEHICLE_ASSIGNED: ['PICKUP_IN_PROGRESS', 'CANCELLED'],
  PICKUP_IN_PROGRESS: ['FOOD_COLLECTED', 'CANCELLED'],
  FOOD_COLLECTED: ['IN_TRANSIT'],
  IN_TRANSIT: ['ARRIVED_AT_DESTINATION'],
  ARRIVED_AT_DESTINATION: ['DELIVERED_CONFIRMED'],
  DELIVERED_CONFIRMED: ['CLOSED'],
  CLOSED: [], // Terminal
  CANCELLED: [] // Terminal
};

export class InvalidStateTransitionError extends Error {
  constructor(currentStatus, targetStatus) {
    super(`Cannot transition donation from '${currentStatus}' to '${targetStatus}'`);
    this.name = 'InvalidStateTransitionError';
    this.statusCode = 400;
  }
}

/**
 * Validates whether a state transition is legal
 */
export const canTransitionDonation = (currentStatus, targetStatus) => {
  const allowed = ALLOWED_TRANSITIONS[currentStatus];
  if (!allowed) return false;
  return allowed.includes(targetStatus);
};

/**
 * Enforces atomic state transition check
 */
export const validateTransition = (currentStatus, targetStatus) => {
  if (!canTransitionDonation(currentStatus, targetStatus)) {
    throw new InvalidStateTransitionError(currentStatus, targetStatus);
  }
  return true;
};
