import { describe, it, expect } from 'vitest';
import { calculateMatchScore, calculateDistanceKm } from '../services/matchingEngine.js';

describe('Deterministic Matching Engine', () => {
  const baseTime = new Date('2026-11-04T12:00:00Z');

  // Indiranagar, Bengaluru
  const donation = {
    dietaryType: 'VEG',
    totalPortionsEstimated: 100,
    consumptionDeadline: new Date('2026-11-04T18:00:00Z'), // 6h shelf life
    pickupLocation: {
      type: 'Point',
      coordinates: [77.6412, 12.9784] // [lng, lat]
    }
  };

  it('should calculate accurate distance between Indiranagar and Koramangala (~5 km)', () => {
    // Koramangala coordinates
    const dist = calculateDistanceKm(12.9784, 77.6412, 12.9352, 77.6245);
    expect(dist).toBeGreaterThan(4.5);
    expect(dist).toBeLessThan(6.0);
  });

  it('should score an eligible nearby NGO with high match', () => {
    const ngo = {
      foodPreferences: ['VEG', 'COOKED'],
      currentHeadcount: 100,
      acceptanceReliabilityScore: 0.95,
      location: {
        type: 'Point',
        coordinates: [77.6245, 12.9352] // Koramangala
      }
    };

    const result = calculateMatchScore(donation, ngo, baseTime);
    expect(result.isEligible).toBe(true);
    expect(result.score).toBeGreaterThan(80);
    expect(result.breakdown.dietary).toBe(30);
  });

  it('should strictly reject non-veg donation to veg-only NGO', () => {
    const nonVegDonation = {
      ...donation,
      dietaryType: 'NON_VEG'
    };

    const vegOnlyNgo = {
      foodPreferences: ['VEG'],
      currentHeadcount: 100,
      acceptanceReliabilityScore: 1.0,
      location: {
        type: 'Point',
        coordinates: [77.6245, 12.9352]
      }
    };

    const result = calculateMatchScore(nonVegDonation, vegOnlyNgo, baseTime);
    expect(result.isEligible).toBe(false);
    expect(result.score).toBe(0);
    expect(result.reason).toContain('Dietary incompatibility');
  });

  it('should reject allocation if transit time exceeds food shelf-life', () => {
    const expiringDonation = {
      ...donation,
      consumptionDeadline: new Date('2026-11-04T12:20:00Z') // Only 20 min shelf life remaining
    };

    const ngo = {
      foodPreferences: ['VEG'],
      currentHeadcount: 100,
      acceptanceReliabilityScore: 1.0,
      location: {
        type: 'Point',
        coordinates: [77.6245, 12.9352]
      }
    };

    const result = calculateMatchScore(expiringDonation, ngo, baseTime);
    expect(result.isEligible).toBe(false);
    expect(result.reason).toContain('Transit window infeasible');
  });
});
