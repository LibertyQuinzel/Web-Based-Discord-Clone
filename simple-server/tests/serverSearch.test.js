/**
 * Tests for User Story 3 — Server Search.
 *
 * API path: authentication → GET /api/servers/search?q=<query>
 * Seed data: "Team Project" (s1), "Gaming Squad" (s2), "Study Group" (s3).
 * Nafisa (1) is in all three; Ashraf (2) is in s1 + s2 only.
 */
const { request, getToken, getSecondToken, ensureInit } = require('./setup');

beforeAll(() => ensureInit(), 30000);

describe('User Story 3 — Server Search (GET /api/servers/search)', () => {
  test('returns matching servers for an exact-word query', async () => {
    const res = await request
      .get('/api/servers/search')
      .set('Authorization', `Bearer ${getToken()}`)
      .query({ q: 'Team' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.servers).toBeInstanceOf(Array);
    expect(res.body.data.servers.length).toBeGreaterThanOrEqual(1);
    expect(res.body.data.servers[0].name).toMatch(/Team/i);
  });

  test('search is case-insensitive', async () => {
    const res = await request
      .get('/api/servers/search')
      .set('Authorization', `Bearer ${getToken()}`)
      .query({ q: 'gaming' });

    expect(res.status).toBe(200);
    expect(res.body.data.servers.length).toBeGreaterThanOrEqual(1);
    expect(res.body.data.servers[0].name).toMatch(/Gaming/i);
  });

  test('returns only servers the user is a member of', async () => {
    const unique = `searcher${Date.now()}`;
    const regRes = await request.post('/api/auth/register').send({
      username: unique, email: `${unique}@test.com`, password: 'pass1234',
    });
    const outsiderToken = regRes.body.data.token;

    const res = await request
      .get('/api/servers/search')
      .set('Authorization', `Bearer ${outsiderToken}`)
      .query({ q: 'Study' });

    expect(res.status).toBe(200);
    expect(res.body.data.servers).toEqual([]);
  });

  test('returns empty array for no matches', async () => {
    const res = await request
      .get('/api/servers/search')
      .set('Authorization', `Bearer ${getToken()}`)
      .query({ q: 'NonExistentServer' });

    expect(res.status).toBe(200);
    expect(res.body.data.servers).toEqual([]);
  });

  test('rejects when query parameter q is missing', async () => {
    const res = await request
      .get('/api/servers/search')
      .set('Authorization', `Bearer ${getToken()}`);

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test('respects the limit parameter', async () => {
    const res = await request
      .get('/api/servers/search')
      .set('Authorization', `Bearer ${getToken()}`)
      .query({ q: 'a', limit: 1 });

    expect(res.status).toBe(200);
    expect(res.body.data.servers.length).toBeLessThanOrEqual(1);
  });

  test('rejects unauthenticated requests', async () => {
    const res = await request
      .get('/api/servers/search')
      .query({ q: 'Team' });

    expect(res.status).toBe(401);
  });
});
