/**
 * Bengaluru Verified NGO Registry & Geospatial Knowledge Base
 * Covers major zones: Central, South, North, East, West, Electronic City, Whitefield, etc.
 */
export const BENGALURU_NGO_MAP_DIRECTORY = [
  {
    ngoName: 'Akshaya Patra Foundation (Central Kitchen)',
    area: 'Rajajinagar',
    zone: 'West Bengaluru',
    pincode: '560010',
    coordinates: [77.5529, 12.9893], // [lng, lat]
    contact: '+91 80 3014 3400',
    capacityHeadcount: 5000,
    acceptedTypes: ['VEG', 'COOKED', 'RAW_GRAINS'],
    hasRefrigeration: true,
    focus: 'Mid-Day Meals, Hunger Relief, Underprivileged Children'
  },
  {
    ngoName: 'Robin Hood Army - Bengaluru Chapter',
    area: 'Indiranagar',
    zone: 'East Bengaluru',
    pincode: '560038',
    coordinates: [77.6412, 12.9784],
    contact: '+91 98860 12345',
    capacityHeadcount: 350,
    acceptedTypes: ['VEG', 'NON_VEG', 'COOKED', 'PACKAGED'],
    hasRefrigeration: false,
    focus: 'Surplus Food Redistribution, Slum Communities, Night Shelters'
  },
  {
    ngoName: 'Samarthanam Trust for the Disabled',
    area: 'HSR Layout',
    zone: 'South-East Bengaluru',
    pincode: '560102',
    coordinates: [77.6389, 12.9116],
    contact: '+91 80 2572 1444',
    capacityHeadcount: 420,
    acceptedTypes: ['VEG', 'NON_VEG', 'COOKED', 'RAW_GRAINS'],
    hasRefrigeration: true,
    focus: 'Differently-Abled Youth, Residential Shelter & Education'
  },
  {
    ngoName: 'Hasiru Dala (Waste Pickers Support)',
    area: 'Koramangala',
    zone: 'South Bengaluru',
    pincode: '560034',
    coordinates: [77.6245, 12.9352],
    contact: '+91 80 4125 5678',
    capacityHeadcount: 280,
    acceptedTypes: ['VEG', 'COOKED', 'PACKAGED'],
    hasRefrigeration: false,
    focus: 'Waste Picker Families, Migrant Workers, Daily Wage Labor'
  },
  {
    ngoName: 'BOSCO Mane (Boys Street Children Rescue)',
    area: 'Chamrajpet',
    zone: 'South-West Bengaluru',
    pincode: '560018',
    coordinates: [77.5683, 12.9575],
    contact: '+91 80 2670 0418',
    capacityHeadcount: 220,
    acceptedTypes: ['VEG', 'NON_VEG', 'COOKED'],
    hasRefrigeration: true,
    focus: 'Street Children, Runaway Youths, Orphan Care'
  },
  {
    ngoName: 'Diya Foundation',
    area: 'Kalyan Nagar',
    zone: 'North-East Bengaluru',
    pincode: '560043',
    coordinates: [77.6433, 13.0232],
    contact: '+91 80 2545 4236',
    capacityHeadcount: 150,
    acceptedTypes: ['VEG', 'COOKED', 'PACKAGED'],
    hasRefrigeration: true,
    focus: 'Vocational Training & Meals for Intellectually Challenged Adults'
  },
  {
    ngoName: 'Vidyaranya Child Care & Old Age Home',
    area: 'Yelahanka',
    zone: 'North Bengaluru',
    pincode: '560064',
    coordinates: [77.5963, 13.1007],
    contact: '+91 80 2846 1777',
    capacityHeadcount: 190,
    acceptedTypes: ['VEG', 'COOKED', 'RAW_GRAINS'],
    hasRefrigeration: true,
    focus: 'Elderly Care, Abandoned Seniors, Orphan Support'
  },
  {
    ngoName: 'Ashwini Charitable Trust',
    area: 'Ulsoor',
    zone: 'Central-East Bengaluru',
    pincode: '560008',
    coordinates: [77.6245, 12.9815],
    contact: '+91 80 2554 9901',
    capacityHeadcount: 160,
    acceptedTypes: ['VEG', 'COOKED'],
    hasRefrigeration: false,
    focus: 'Slum Child Welfare & Afternoon Nutrition'
  },
  {
    ngoName: 'Belaku Trust Community Center',
    area: 'Kanakapura Road / Konanakunte',
    zone: 'South Bengaluru',
    pincode: '560062',
    coordinates: [77.5552, 12.8792],
    contact: '+91 80 2632 1010',
    capacityHeadcount: 200,
    acceptedTypes: ['VEG', 'COOKED', 'RAW_GRAINS'],
    hasRefrigeration: true,
    focus: 'Rural-Urban Fringe Women & Child Malnutrition'
  },
  {
    ngoName: 'Whitefield Rising Relief Kitchen',
    area: 'Whitefield',
    zone: 'East Bengaluru (IT Corridor)',
    pincode: '560066',
    coordinates: [77.7499, 12.9698],
    contact: '+91 99000 88221',
    capacityHeadcount: 300,
    acceptedTypes: ['VEG', 'NON_VEG', 'COOKED', 'PACKAGED'],
    hasRefrigeration: true,
    focus: 'Migrant Construction Workers, Rapid Community Emergency Relief'
  },
  {
    ngoName: 'Electronic City Slum Outreach & Food Center',
    area: 'Electronic City Phase 1',
    zone: 'South Bengaluru (IT Corridor)',
    pincode: '560100',
    coordinates: [77.6762, 12.8452],
    contact: '+91 80 6789 2211',
    capacityHeadcount: 260,
    acceptedTypes: ['VEG', 'NON_VEG', 'COOKED'],
    hasRefrigeration: false,
    focus: 'Informal Settlements & Daily Wage Labor Communities'
  },
  {
    ngoName: 'Asha Jeevan Old Age Home',
    area: 'Bannerghatta Road',
    zone: 'South Bengaluru',
    pincode: '560076',
    coordinates: [77.5971, 12.8988],
    contact: '+91 80 2658 9012',
    capacityHeadcount: 140,
    acceptedTypes: ['VEG', 'COOKED'],
    hasRefrigeration: true,
    focus: 'Destitute Elderly & Palliative Care Nutrition'
  }
];

/**
 * Common landmark coordinates in Bengaluru for geo-referencing & route estimation
 */
export const BENGALURU_LANDMARKS = {
  'Majestic / Kempegowda Bus Station': [77.5713, 12.9772],
  'MG Road / Brigade Road': [77.6074, 12.9744],
  'Indiranagar 100ft Road': [77.6412, 12.9784],
  'Koramangala Sony World Junction': [77.6245, 12.9352],
  'HSR Layout BDA Complex': [77.6389, 12.9116],
  'Whitefield ITPL': [77.7499, 12.9698],
  'Electronic City Toll Gate': [77.6762, 12.8452],
  'Hebbal Flyover': [77.5925, 13.0358],
  'Jayanagar 4th Block': [77.5834, 12.9299],
  'Malleshwaram 8th Cross': [77.5714, 13.0031],
  'Yelahanka New Town': [77.5963, 13.1007],
  'Marathahalli Bridge': [77.7011, 12.9569]
};
