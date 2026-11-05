import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { app } from '../app.js';

let mongod;
let donorCookie;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri());

  const res = await request(app).post('/api/v1/auth/register').send({
    name: 'Philanthropist Donor',
    email: 'giving@donor.org',
    phone: '9888833333',
    password: 'DonorPassword123!',
    role: 'DONOR',
    donorType: 'INDIVIDUAL'
  });
  donorCookie = res.headers['set-cookie'];
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongod.stop();
});

describe('Razorpay Monetary Donations Integration', () => {
  let createdOrderId;

  it('should initialize a Razorpay order with valid amount and 80G PAN', async () => {
    const res = await request(app)
      .post('/api/v1/payments/create-order')
      .set('Cookie', donorCookie)
      .send({
        amount: 2500,
        panNumber: 'ABCDE1234F'
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.amount).toBe(250000); // 2500 * 100 paise
    expect(res.body.data.currency).toBe('INR');
    expect(res.body.data.orderId).toBeDefined();

    createdOrderId = res.body.data.orderId;
  });

  it('should capture payment and verify signature', async () => {
    const res = await request(app)
      .post('/api/v1/payments/verify')
      .set('Cookie', donorCookie)
      .send({
        razorpayOrderId: createdOrderId,
        razorpayPaymentId: 'pay_blr_mock_99881',
        razorpaySignature: 'valid_test_sig'
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.payment.status).toBe('CAPTURED');
    expect(res.body.data.payment.taxExemption80GRequested).toBe(true);
  });
});
