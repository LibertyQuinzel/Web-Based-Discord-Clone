/**
 * Tests for the Users module — search, profile, and status updates.
 */
const { request, getToken, ensureInit } = require('./setup');

beforeAll(() => ensureInit(), 30000);

describe('Users — GET /api/users/search', () => {
  test('finds users by username', async () => {
    const res = await request
      .get('/api/users/search')
      .set('Authorization', `Bearer ${getToken()}`)
      .query({ q: 'Ashraf' });

    expect(res.status).toBe(200);
    expect(res.body.data.users.length).toBeGreaterThanOrEqual(1);
    expect(res.body.data.users[0].username).toBe('Ashraf');
  });

  test('search is case-insensitive', async () => {
    const res = await request
      .get('/api/users/search')
      .set('Authorization', `Bearer ${getToken()}`)
      .query({ q: 'james' });

    expect(res.status).toBe(200);
    expect(res.body.data.users.length).toBeGreaterThanOrEqual(1);
  });

  test('rejects missing query parameter', async () => {
    const res = await request
      .get('/api/users/search')
      .set('Authorization', `Bearer ${getToken()}`);

    expect(res.status).toBe(400);
  });
});

describe('Users — PUT /api/users/me/profile', () => {
  test('updates display name', async () => {
    const res = await request
      .put('/api/users/me/profile')
      .set('Authorization', `Bearer ${getToken()}`)
      .send({ displayName: 'Nafisa Updated' });

    expect(res.status).toBe(200);
    expect(res.body.data.user.display_name).toBe('Nafisa Updated');
  });

  test('restores original display name', async () => {
    const res = await request
      .put('/api/users/me/profile')
      .set('Authorization', `Bearer ${getToken()}`)
      .send({ displayName: 'Nafisa' });

    expect(res.status).toBe(200);
    expect(res.body.data.user.display_name).toBe('Nafisa');
  });
});

describe('Users — PUT /api/users/me/status', () => {
  test('updates user status', async () => {
    const res = await request
      .put('/api/users/me/status')
      .set('Authorization', `Bearer ${getToken()}`)
      .send({ status: 'dnd' });

    expect(res.status).toBe(200);
    expect(res.body.data.user.status).toBe('dnd');
  });

  test('rejects invalid status value', async () => {
    const res = await request
      .put('/api/users/me/status')
      .set('Authorization', `Bearer ${getToken()}`)
      .send({ status: 'invalid' });

    expect(res.status).toBe(400);
  });
});
