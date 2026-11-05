import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { app } from '../app.js';

let mongod;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongod.stop();
});

describe('Authentication Flow Integration', () => {
  const testDonor = {
    name: 'Bangalore Caterers',
    email: 'contact@bangalorecaterers.com',
    phone: '9876543210',
    password: 'SecurePassword123!',
    role: 'DONOR',
    donorType: 'RESTAURANT',
    organizationName: 'Bangalore Caterers Pvt Ltd'
  };

  it('should register a new donor successfully and return HttpOnly cookies', async () => {
    const res = await request(app).post('/api/v1/auth/register').send(testDonor);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe(testDonor.email);

    // Verify Set-Cookie headers for HttpOnly cookies
    const cookies = res.headers['set-cookie'];
    expect(cookies).toBeDefined();
    expect(cookies.some((c) => c.includes('fb_access='))).toBe(true);
    expect(cookies.some((c) => c.includes('fb_refresh='))).toBe(true);
  });

  it('should prevent registration with duplicate email/phone', async () => {
    const res = await request(app).post('/api/v1/auth/register').send(testDonor);
    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
  });

  it('should authenticate user and issue fresh cookies on login', async () => {
    const res = await request(app).post('/api/v1/auth/login').send({
      identifier: testDonor.email,
      password: testDonor.password
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.name).toBe(testDonor.name);

    const cookies = res.headers['set-cookie'];
    expect(cookies.some((c) => c.includes('fb_access='))).toBe(true);
  });

  it('should reject invalid credentials', async () => {
    const res = await request(app).post('/api/v1/auth/login').send({
      identifier: testDonor.email,
      password: 'WrongPassword999!'
    });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});
