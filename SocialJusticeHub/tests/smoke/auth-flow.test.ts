import { describe, it, expect } from 'vitest';
import request from 'supertest';

const BASE = process.env.SMOKE_BASE_URL ?? 'http://localhost:3001';
const RUN_SMOKE = !!process.env.RUN_SMOKE;

describe.skipIf(!RUN_SMOKE)('smoke: auth flow', () => {
  it('healthcheck returns 200 with dbLatencyMs', async () => {
    const res = await request(BASE).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(typeof res.body.dbLatencyMs).toBe('number');
  });

  it('rejects login with bad credentials', async () => {
    const res = await request(BASE)
      .post('/api/login')
      .send({ username: 'no-such-user-xyz', password: 'wrong-pwd-1234!' });
    expect([400, 401, 403]).toContain(res.status);
  });
});
