import { Vehicle } from '../models/Vehicle.js';
import { logger } from './logger.js';

/**
 * Pre-configured network of active food rescue trucks and vans stationed
 * strategically across Bengaluru hubs (Koramangala, Indiranagar, Whitefield,
 * HSR Layout, Rajajinagar, Electronic City, Yelahanka, Jayanagar, Marathahalli).
 */
export const BENGALURU_DELIVERY_FLEET = [
  {
    providerType: 'INTERNAL_NGO',
    vehicleType: 'REFRIGERATED_TRUCK',
    registrationNumber: 'KA-01-EQ-9922',
    driverName: 'Manjunath Gowda',
    driverPhone: '9845012345',
    capacityKg: 1200,
    hasCooling: true,
    isActive: true,
    currentLocation: {
      type: 'Point',
      coordinates: [77.6245, 12.9352] // Koramangala
    }
  },
  {
    providerType: 'INTERNAL_NGO',
    vehicleType: 'TEMPO_VAN',
    registrationNumber: 'KA-03-MB-4512',
    driverName: 'Ramesh Kumar',
    driverPhone: '9845123456',
    capacityKg: 650,
    hasCooling: false,
    isActive: true,
    currentLocation: {
      type: 'Point',
      coordinates: [77.6412, 12.9784] // Indiranagar
    }
  },
  {
    providerType: 'AUTHORIZED_PARTNER',
    vehicleType: 'REFRIGERATED_TRUCK',
    registrationNumber: 'KA-53-TR-8819',
    driverName: 'Suresh Babu',
    driverPhone: '9845234567',
    capacityKg: 1500,
    hasCooling: true,
    isActive: true,
    currentLocation: {
      type: 'Point',
      coordinates: [77.7499, 12.9698] // Whitefield
    }
  },
  {
    providerType: 'INTERNAL_NGO',
    vehicleType: 'TEMPO_VAN',
    registrationNumber: 'KA-05-AA-7231',
    driverName: 'Basavaraj Patil',
    driverPhone: '9845345678',
    capacityKg: 800,
    hasCooling: false,
    isActive: true,
    currentLocation: {
      type: 'Point',
      coordinates: [77.6389, 12.9116] // HSR Layout
    }
  },
  {
    providerType: 'AUTHORIZED_PARTNER',
    vehicleType: 'REFRIGERATED_TRUCK',
    registrationNumber: 'KA-02-CD-6644',
    driverName: 'Anand Murthy',
    driverPhone: '9845456789',
    capacityKg: 1400,
    hasCooling: true,
    isActive: true,
    currentLocation: {
      type: 'Point',
      coordinates: [77.5529, 12.9893] // Rajajinagar / West Bengaluru
    }
  },
  {
    providerType: 'INTERNAL_NGO',
    vehicleType: 'TEMPO_VAN',
    registrationNumber: 'KA-51-EF-3321',
    driverName: 'Karthik Rao',
    driverPhone: '9845567890',
    capacityKg: 700,
    hasCooling: false,
    isActive: true,
    currentLocation: {
      type: 'Point',
      coordinates: [77.6766, 12.8452] // Electronic City
    }
  },
  {
    providerType: 'AUTHORIZED_PARTNER',
    vehicleType: 'REFRIGERATED_TRUCK',
    registrationNumber: 'KA-50-GH-1109',
    driverName: 'Shivanna Naik',
    driverPhone: '9845678901',
    capacityKg: 1100,
    hasCooling: true,
    isActive: true,
    currentLocation: {
      type: 'Point',
      coordinates: [77.5963, 13.1007] // Yelahanka / North Bengaluru
    }
  },
  {
    providerType: 'INTERNAL_NGO',
    vehicleType: 'TEMPO_VAN',
    registrationNumber: 'KA-05-MN-5590',
    driverName: 'Pradeep Shenoy',
    driverPhone: '9845789012',
    capacityKg: 600,
    hasCooling: false,
    isActive: true,
    currentLocation: {
      type: 'Point',
      coordinates: [77.5855, 12.925] // Jayanagar
    }
  },
  {
    providerType: 'AUTHORIZED_PARTNER',
    vehicleType: 'REFRIGERATED_TRUCK',
    registrationNumber: 'KA-03-ZX-7845',
    driverName: 'Venkatesh Murthy',
    driverPhone: '9845890123',
    capacityKg: 1800,
    hasCooling: true,
    isActive: true,
    currentLocation: {
      type: 'Point',
      coordinates: [77.7011, 12.9569] // Marathahalli / Outer Ring Road
    }
  }
];

export const seedBengaluruTrucks = async () => {
  try {
    for (const truck of BENGALURU_DELIVERY_FLEET) {
      const existing = await Vehicle.findOne({ registrationNumber: truck.registrationNumber });
      if (!existing) {
        await Vehicle.create(truck);
      } else {
        // Ensure active and in Bengaluru coordinates
        existing.isActive = true;
        existing.currentLocation = truck.currentLocation;
        existing.capacityKg = truck.capacityKg;
        existing.hasCooling = truck.hasCooling;
        await existing.save();
      }
    }
    logger.info(`Bengaluru delivery fleet validated (${BENGALURU_DELIVERY_FLEET.length} active trucks/vans stationed across zones)`);
  } catch (err) {
    logger.warn(`Failed to seed Bengaluru fleet: ${err.message}`);
  }
};
