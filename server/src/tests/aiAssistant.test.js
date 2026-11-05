import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { app } from '../app.js';
import { executeAITool } from '../ai/assistant.js';
import { Donation } from '../models/Donation.js';
import { DonorProfile } from '../models/DonorProfile.js';
import { User } from '../models/User.js';

let mongod;
let adminCookie;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri());

  // Register Admin
  const adminRes = await request(app).post('/api/v1/auth/register').send({
    name: 'Admin User',
    email: 'admin.ops@foodbridge.org',
    phone: '9888800000',
    password: 'AdminPassword123!',
    role: 'ADMIN'
  });
  adminCookie = adminRes.headers['set-cookie'];

  // Seed user and donor
  const user = new User({
    name: 'Donor User',
    email: 'testdonor@foodbridge.org',
    phone: '9888811111',
    passwordHash: 'hash',
    role: 'DONOR'
  });
  await user.save();

  const donor = new DonorProfile({
    userId: user._id,
    donorType: 'RESTAURANT',
    organizationName: 'Bangalore Tiffins',
    address: { line1: 'MG Rd', area: 'Central', city: 'Bengaluru', pincode: '560001' },
    location: { type: 'Point', coordinates: [77.6033, 12.9756] }
  });
  await donor.save();

  const donation = new Donation({
    donationCode: 'FBD-20261104-1122',
    donorId: donor._id,
    foodCategory: 'COOKED_MEALS',
    dietaryType: 'VEG',
    foodItems: [{ name: 'Idli Vada portions', quantity: 80, unit: 'PORTIONS' }],
    totalPortionsEstimated: 80,
    consumptionDeadline: new Date(Date.now() + 4 * 3600 * 1000),
    pickupAddress: { line1: 'MG Rd', area: 'Central', city: 'Bengaluru', pincode: '560001', contactPerson: 'Suresh', contactPhone: '9888811111' },
    pickupLocation: { type: 'Point', coordinates: [77.6033, 12.9756] },
    status: 'CLOSED'
  });
  await donation.save();
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongod.stop();
});

describe('AI Operations Assistant Tool Isolation', () => {
  it('should generate accurate operations report via restricted tool', async () => {
    const report = await executeAITool('generateOperationsReport', {});
    expect(report.region).toBe('Bengaluru, Karnataka');
    expect(report.totalDonationsLogged).toBe(1);
    expect(report.totalMealsRescued).toBe(80);
  });

  it('should allow admin to query restricted tools via API', async () => {
    const res = await request(app)
      .post('/api/v1/ai/tools/execute')
      .set('Cookie', adminCookie)
      .send({
        toolName: 'generateOperationsReport'
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.output.totalMealsRescued).toBe(80);
  });

  it('should block non-admin users from AI tools endpoint', async () => {
    const donorRes = await request(app).post('/api/v1/auth/register').send({
      name: 'Regular User',
      email: 'regular@user.com',
      phone: '9888822222',
      password: 'Password123!',
      role: 'DONOR',
      donorType: 'INDIVIDUAL'
    });

    const res = await request(app)
      .post('/api/v1/ai/tools/execute')
      .set('Cookie', donorRes.headers['set-cookie'])
      .send({ toolName: 'generateOperationsReport' });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it('should search Bengaluru NGOs by location using geospatial knowledge tool', async () => {
    const searchRes = await executeAITool('searchBengaluruNGOsByLocation', {
      areaOrZone: 'Koramangala',
      maxDistanceKm: 15
    });
    expect(searchRes.searchedLocation).toBeDefined();
    expect(searchRes.referenceCoordinates).toHaveLength(2);
    expect(searchRes.nearbyNGOs.length).toBeGreaterThan(0);
    expect(searchRes.nearbyNGOs[0].ngoName).toBeDefined();
    expect(searchRes.nearbyNGOs[0].coordinates).toHaveLength(2);
  });

  it('should calculate transit route and waypoints across Bengaluru corridors', async () => {
    const routeRes = await executeAITool('calculateTransitRoute', {
      originArea: 'Indiranagar',
      destinationArea: 'Koramangala'
    });
    expect(routeRes.roadDistanceKm).toBeGreaterThan(3);
    expect(routeRes.transitDurationMinutes).toBeGreaterThan(10);
    expect(routeRes.trafficCondition).toBeDefined();
    expect(routeRes.routeWaypoints.length).toBeGreaterThan(0);
  });
});
