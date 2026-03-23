/**
 * Tests for the Direct Messages module — list and create.
 *
 * Seed data: dm1 (Nafisa ↔ Ashraf), dm2 (Nafisa ↔ James).
 */
const { request, getToken, ensureInit } = require('./setup');

beforeAll(() => ensureInit(), 30000);

describe('Direct Messages — GET /api/direct-messages', () => {
  test('returns DMs for the authenticated user', async () => {
    const res = await request
      .get('/api/direct-messages')
      .set('Authorization', `Bearer ${getToken()}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.directMessages.length).toBeGreaterThanOrEqual(2);
  });
});

describe('Direct Messages — POST /api/direct-messages', () => {
  test('creates a new DM or returns existing', async () => {
    const res = await request
      .post('/api/direct-messages')
      .set('Authorization', `Bearer ${getToken()}`)
      .send({ userId: '4' });

    expect([200, 201]).toContain(res.status);
    const dm = res.body.data.directMessage;
    expect(dm.id).toBeDefined();
    expect(dm.participants).toContain('1');
    expect(dm.participants).toContain('4');
  });

  test('returns the existing DM if it already exists', async () => {
    const res = await request
      .post('/api/direct-messages')
      .set('Authorization', `Bearer ${getToken()}`)
      .send({ userId: '2' });

    expect(res.status).toBe(200);
    expect(res.body.data.directMessage.id).toBe('dm1');
  });
});
