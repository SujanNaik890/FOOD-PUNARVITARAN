/**
 * Haversine distance in kilometers between two geo coordinates
 */
export const calculateDistanceKm = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

/**
 * Weights for deterministic matching formula
 */
export const MATCHING_WEIGHTS = {
  DIETARY: 30,
  CAPACITY: 25,
  DISTANCE: 20,
  URGENCY: 15,
  RELIABILITY: 10
};

/**
 * Deterministic NGO Match Score Calculator
 *
 * @param {Object} donation - { dietaryType, totalPortionsEstimated, consumptionDeadline, pickupLocation }
 * @param {Object} ngo - { foodPreferences, currentHeadcount, location, acceptanceReliabilityScore, storageFacilities }
 * @param {Date} [currentTime=new Date()]
 * @returns {Object} { score: number, breakdown: Object, isEligible: boolean }
 */
export const calculateMatchScore = (donation, ngo, currentTime = new Date()) => {
  // 1. Hard Dietary Constraint
  // If donation is NON_VEG but NGO only accepts VEG, strictly ineligible
  const isDietaryCompatible =
    donation.dietaryType === 'VEG' ||
    donation.dietaryType === 'VEGAN' ||
    ngo.foodPreferences.includes('NON_VEG');

  if (!isDietaryCompatible) {
    return {
      score: 0,
      isEligible: false,
      reason: 'Dietary incompatibility: Non-veg food cannot be delivered to veg-only NGO'
    };
  }

  // Dietary score (30%)
  const dietaryScore = MATCHING_WEIGHTS.DIETARY;

  // 2. Capacity Score (25%)
  // Ratio of NGO headcount capacity vs donation portions
  const capacityRatio = Math.min(1.0, ngo.currentHeadcount / donation.totalPortionsEstimated);
  const capacityScore = capacityRatio * MATCHING_WEIGHTS.CAPACITY;

  // 3. Proximity / Distance Score (20%)
  // Distance decay over Bengaluru region (max effective radius: 25km)
  const distanceKm = calculateDistanceKm(
    donation.pickupLocation.coordinates[1],
    donation.pickupLocation.coordinates[0],
    ngo.location.coordinates[1],
    ngo.location.coordinates[0]
  );

  const MAX_RADIUS_KM = 25;
  const distanceFactor = Math.max(0, 1 - distanceKm / MAX_RADIUS_KM);
  const distanceScore = distanceFactor * MATCHING_WEIGHTS.DISTANCE;

  // 4. Urgency & Shelf-Life Feasibility (15%)
  // Ensure food does not expire before estimated delivery (assume 25 km/h urban speed + 30 min buffer)
  const estimatedTransitHours = distanceKm / 25 + 0.5;
  const remainingShelfLifeHours =
    (new Date(donation.consumptionDeadline).getTime() - new Date(currentTime).getTime()) /
    (1000 * 60 * 60);

  if (remainingShelfLifeHours <= estimatedTransitHours) {
    return {
      score: 0,
      isEligible: false,
      reason: `Transit window infeasible: Requires ${estimatedTransitHours.toFixed(1)}h, only ${remainingShelfLifeHours.toFixed(1)}h shelf-life remaining`
    };
  }

  const urgencyFactor = Math.min(1.0, Math.max(0.2, 1 - estimatedTransitHours / remainingShelfLifeHours));
  const urgencyScore = urgencyFactor * MATCHING_WEIGHTS.URGENCY;

  // 5. Historical Acceptance & Proof Reliability (10%)
  const reliabilityFactor = Math.min(1.0, Math.max(0, ngo.acceptanceReliabilityScore || 1.0));
  const reliabilityScore = reliabilityFactor * MATCHING_WEIGHTS.RELIABILITY;

  const totalScore = Math.round(
    dietaryScore + capacityScore + distanceScore + urgencyScore + reliabilityScore
  );

  return {
    score: totalScore,
    isEligible: true,
    distanceKm: Math.round(distanceKm * 10) / 10,
    breakdown: {
      dietary: dietaryScore,
      capacity: Math.round(capacityScore * 10) / 10,
      distance: Math.round(distanceScore * 10) / 10,
      urgency: Math.round(urgencyScore * 10) / 10,
      reliability: Math.round(reliabilityScore * 10) / 10
    }
  };
};
