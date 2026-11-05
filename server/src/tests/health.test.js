import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../app.js';

describe('FoodBridge App Gateway', () => {
  it('GET /api/v1/health should return 200 operational status', async () => {
    const res = await request(app).get('/api/v1/health');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.region).toBe('Bengaluru, India');
  });
});
