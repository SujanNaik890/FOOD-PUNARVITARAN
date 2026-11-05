import { describe, it, expect } from 'vitest';
import {
  canTransitionDonation,
  validateTransition,
  InvalidStateTransitionError
} from '../services/donationStateMachine.js';

describe('Donation Lifecycle State Machine', () => {
  it('should allow valid sequential transitions', () => {
    expect(canTransitionDonation('DRAFT', 'SUBMITTED')).toBe(true);
    expect(canTransitionDonation('SUBMITTED', 'VALIDATED')).toBe(true);
    expect(canTransitionDonation('VALIDATED', 'MATCHING')).toBe(true);
    expect(canTransitionDonation('MATCHING', 'ALLOCATED_PENDING_APPROVAL')).toBe(true);
    expect(canTransitionDonation('ALLOCATED_PENDING_APPROVAL', 'NGO_NOTIFIED')).toBe(true);
    expect(canTransitionDonation('NGO_NOTIFIED', 'NGO_ACCEPTED')).toBe(true);
    expect(canTransitionDonation('NGO_ACCEPTED', 'VEHICLE_ASSIGNED')).toBe(true);
    expect(canTransitionDonation('VEHICLE_ASSIGNED', 'PICKUP_IN_PROGRESS')).toBe(true);
    expect(canTransitionDonation('PICKUP_IN_PROGRESS', 'FOOD_COLLECTED')).toBe(true);
    expect(canTransitionDonation('FOOD_COLLECTED', 'IN_TRANSIT')).toBe(true);
    expect(canTransitionDonation('IN_TRANSIT', 'ARRIVED_AT_DESTINATION')).toBe(true);
    expect(canTransitionDonation('ARRIVED_AT_DESTINATION', 'DELIVERED_CONFIRMED')).toBe(true);
    expect(canTransitionDonation('DELIVERED_CONFIRMED', 'CLOSED')).toBe(true);
  });

  it('should reject invalid skip transitions and throw InvalidStateTransitionError', () => {
    expect(canTransitionDonation('SUBMITTED', 'CLOSED')).toBe(false);
    expect(canTransitionDonation('VALIDATED', 'DELIVERED_CONFIRMED')).toBe(false);

    expect(() => validateTransition('SUBMITTED', 'DELIVERED_CONFIRMED')).toThrow(
      InvalidStateTransitionError
    );
  });

  it('should not allow transitions out of terminal states', () => {
    expect(canTransitionDonation('CLOSED', 'DRAFT')).toBe(false);
    expect(canTransitionDonation('REJECTED', 'MATCHING')).toBe(false);
    expect(canTransitionDonation('CANCELLED', 'SUBMITTED')).toBe(false);
  });
});
