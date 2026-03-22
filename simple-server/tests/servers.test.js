/**
 * Tests for the Server module — CRUD operations and member management.
 *
 * Seed data: Team Project (s1: 5 members), Gaming Squad (s2: 3 members), Study Group (s3: 4 members).
 */
const { request, getToken, getSecondToken, ensureInit } = require('./setup');

beforeAll(() => ensureInit(), 30000);

describe('Servers — GET /api/servers', () => {
  test('returns servers for the authenticated user', async () => {
    const res = await request
      .get('/api/servers')
      .set('Authorization', `Bearer ${getToken()}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    const servers = res.body.data.servers;
    expect(servers).toBeInstanceOf(Array);
    expect(servers.length).toBeGreaterThanOrEqual(3);
  });

  test('each server includes a members array', async () => {
    const res = await request
      .get('/api/servers')
      .set('Authorization', `Bearer ${getToken()}`);

    const server = res.body.data.servers.find(s => s.id === 's1');
    expect(server).toBeDefined();
    expect(server.members).toBeInstanceOf(Array);
    expect(server.members.length).toBeGreaterThanOrEqual(5);
  });
});

describe('Servers — GET /api/servers/:serverId', () => {
  test('returns server details with members', async () => {
    const res = await request
      .get('/api/servers/s1')
      .set('Authorization', `Bearer ${getToken()}`);

    expect(res.status).toBe(200);
    expect(res.body.data.server.name).toBe('Team Project');
    expect(res.body.data.server.members).toBeInstanceOf(Array);
  });

  test('rejects access from a non-member', async () => {
    const unique = `outsider${Date.now()}`;
    const regRes = await request.post('/api/auth/register').send({
      username: unique, email: `${unique}@test.com`, password: 'pass1234',
    });
    const outsiderToken = regRes.body.data.token;

    const res = await request
      .get('/api/servers/s1')
      .set('Authorization', `Bearer ${outsiderToken}`);

    expect(res.status).toBe(403);
  });
});

describe('Servers — POST / PUT / DELETE', () => {
  let createdServerId;

  test('POST /api/servers creates a new server', async () => {
    const res = await request
      .post('/api/servers')
      .set('Authorization', `Bearer ${getToken()}`)
      .send({ name: 'Test Server', icon: '🧪' });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    createdServerId = res.body.data.server.id;
    expect(createdServerId).toBeDefined();
  });

  test('PUT /api/servers/:serverId updates the server', async () => {
    const res = await request
      .put(`/api/servers/${createdServerId}`)
      .set('Authorization', `Bearer ${getToken()}`)
      .send({ name: 'Renamed Server' });

    expect(res.status).toBe(200);
    expect(res.body.data.server.name).toBe('Renamed Server');
  });

  test('DELETE /api/servers/:serverId deletes the server', async () => {
    const res = await request
      .delete(`/api/servers/${createdServerId}`)
      .set('Authorization', `Bearer ${getToken()}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
