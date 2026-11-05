import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { app } from '../app.js';
import { Vehicle } from '../models/Vehicle.js';
import { NGOProfile } from '../models/NGOProfile.js';

let mongod;
let donorCookie;
let adminCookie;
let ngoCookie;
let createdDonationId;
let createdNgoId;
let vehicleId;
let deliveryRecord;
let pickupCode;
let dropoffCode;
let ngoRequestId;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri());

  // 1. Register Donor
  const donorRes = await request(app).post('/api/v1/auth/register').send({
    name: 'ITC Gardenia Kitchen',
    email: 'chef@itcgardenia.com',
    phone: '9888877771',
    password: 'Password123!',
    role: 'DONOR',
    donorType: 'HOTEL',
    organizationName: 'ITC Gardenia',
    address: { line1: 'Residency Rd', area: 'Ashok Nagar', city: 'Bengaluru', pincode: '560025' },
    coordinates: { latitude: 12.9698, longitude: 77.5985 }
  });
  donorCookie = donorRes.headers['set-cookie'];

  // 2. Register Admin
  const adminRes = await request(app).post('/api/v1/auth/register').send({
    name: 'FoodBridge Operations Lead',
    email: 'admin@foodbridge.org',
    phone: '9888877772',
    password: 'AdminPassword123!',
    role: 'ADMIN'
  });
  adminCookie = adminRes.headers['set-cookie'];

  // 3. Register NGO
  const ngoRes = await request(app).post('/api/v1/auth/register').send({
    name: 'Akshaya Patra Coordinator',
    email: 'coord@akshayapatra.org',
    phone: '9888877773',
    password: 'NgoPassword123!',
    role: 'NGO_MANAGER',
    ngoName: 'Akshaya Patra Foundation',
    registrationNumber: 'BLR-DARPAN-4021',
    address: { line1: 'Rajajinagar 1st Block', area: 'Rajajinagar', city: 'Bengaluru', pincode: '560010' },
    coordinates: { latitude: 12.9982, longitude: 77.553 }
  });
  ngoCookie = ngoRes.headers['set-cookie'];

  // Mark NGO as verified and assign capacity
  const ngoProfile = await NGOProfile.findOne({ ngoName: 'Akshaya Patra Foundation' });
  ngoProfile.verificationStatus = 'VERIFIED';
  ngoProfile.currentHeadcount = 250;
  await ngoProfile.save();
  createdNgoId = ngoProfile._id.toString();

  // Create an authorized delivery vehicle
  const vehicle = new Vehicle({
    providerType: 'AUTHORIZED_PARTNER',
    vehicleType: 'TEMPO_VAN',
    registrationNumber: 'KA-01-EQ-9922',
    driverName: 'Ramesh Kumar',
    driverPhone: '9777766661',
    capacityKg: 500,
    hasCooling: true,
    isActive: true,
    currentLocation: { type: 'Point', coordinates: [77.5985, 12.9698] }
  });
  await vehicle.save();
  vehicleId = vehicle._id.toString();
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongod.stop();
});

describe('End-to-End Donation Lifecycle State Machine', () => {
  it('Step 1: Donor creates food donation -> Status VALIDATED', async () => {
    const futureDeadline = new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(); // 6h future

    const res = await request(app)
      .post('/api/v1/donations')
      .set('Cookie', donorCookie)
      .send({
        foodCategory: 'COOKED_MEALS',
        dietaryType: 'VEG',
        foodItems: [{ name: 'Rice and Dal Portions', quantity: 150, unit: 'PORTIONS' }],
        perishable: true,
        consumptionDeadline: futureDeadline,
        storageCondition: 'HEATED',
        pickupAddress: {
          line1: 'Residency Rd Banquet Kitchen',
          area: 'Ashok Nagar',
          city: 'Bengaluru',
          pincode: '560025',
          contactPerson: 'Chef Raghav',
          contactPhone: '9888877771'
        },
        pickupCoordinates: { latitude: 12.9698, longitude: 77.5985 }
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.donation.status).toBe('VALIDATED');
    createdDonationId = res.body.data.donation._id;
  });

  it('Step 2: Admin discovers and ranks matching NGOs', async () => {
    const res = await request(app)
      .get(`/api/v1/donations/${createdDonationId}/matches`)
      .set('Cookie', adminCookie);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data.matches)).toBe(true);
    expect(res.body.data.matches.length).toBeGreaterThan(0);
    expect(res.body.data.matches[0].ngo.name).toBe('Akshaya Patra Foundation');
  });

  it('Step 3: Admin approves allocation -> Status NGO_NOTIFIED', async () => {
    const res = await request(app)
      .post('/api/v1/donations/allocate')
      .set('Cookie', adminCookie)
      .send({
        donationId: createdDonationId,
        selectedNgoId: createdNgoId,
        allocationNotes: 'Verified dietary and rapid delivery feasibility'
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.ngoRequest.status).toBe('PENDING');
    ngoRequestId = res.body.data.ngoRequest._id;
  });

  it('Step 4: NGO accepts incoming donation -> Status NGO_ACCEPTED', async () => {
    const res = await request(app)
      .post('/api/v1/donations/respond-request')
      .set('Cookie', ngoCookie)
      .send({
        allocationId: ngoRequestId,
        action: 'ACCEPT'
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.donationStatus).toBe('NGO_ACCEPTED');
  });

  it('Step 5: Admin assigns vehicle and generates pickup/drop OTPs -> Status VEHICLE_ASSIGNED', async () => {
    const res = await request(app)
      .post('/api/v1/donations/assign-vehicle')
      .set('Cookie', adminCookie)
      .send({
        donationId: createdDonationId,
        vehicleId: vehicleId
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.pickupOtp).toBeDefined();
    expect(res.body.data.deliveryOtp).toBeDefined();

    deliveryRecord = res.body.data.delivery;
    pickupCode = res.body.data.pickupOtp;
    dropoffCode = res.body.data.deliveryOtp;
  });

  it('Step 6: Driver verifies Pickup OTP at Donor kitchen -> Status IN_TRANSIT', async () => {
    const res = await request(app)
      .post('/api/v1/donations/delivery/confirm-pickup')
      .set('Cookie', adminCookie)
      .send({
        deliveryId: deliveryRecord._id,
        otp: pickupCode
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.delivery.status).toBe('FOOD_PICKED_UP');
  });

  it('Step 7: NGO verifies Delivery OTP + submits receipt proof -> Status CLOSED', async () => {
    const res = await request(app)
      .post('/api/v1/donations/delivery/confirm-delivery')
      .set('Cookie', ngoCookie)
      .send({
        deliveryId: deliveryRecord._id,
        otp: dropoffCode,
        receivedQuantity: 150,
        proofImageUrl: 'https://cloudinary.com/foodbridge/verified-delivery-receipt.jpg'
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.donation.status).toBe('CLOSED');
  });
});
