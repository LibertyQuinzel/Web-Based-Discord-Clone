/**
 * Tests for the Channel module — CRUD and server-channel relationships.
 *
 * Seed data: channels c1–c7 across servers s1–s3.
 */
const { request, getToken, ensureInit } = require('./setup');

beforeAll(() => ensureInit(), 30000);

describe('Channels — GET /api/channels/server/:serverId', () => {
  test('returns channels for a server the user belongs to', async () => {
    const res = await request
      .get('/api/channels/server/s1')
      .set('Authorization', `Bearer ${getToken()}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    const channels = res.body.data.channels;
    expect(channels.length).toBeGreaterThanOrEqual(3);
  });
});

describe('Channels — POST /api/channels', () => {
  let newChannelId;

  test('creates a new channel in a server', async () => {
    const res = await request
      .post('/api/channels')
      .set('Authorization', `Bearer ${getToken()}`)
      .send({ name: 'test-channel', serverId: 's1' });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    newChannelId = res.body.data.channel.id;
    expect(newChannelId).toBeDefined();
  });

  test('GET /api/channels/:channelId retrieves the new channel', async () => {
    if (!newChannelId) return;
    const res = await request
      .get(`/api/channels/${newChannelId}`)
      .set('Authorization', `Bearer ${getToken()}`);

    expect(res.status).toBe(200);
  });

  test('DELETE /api/channels/:channelId removes it', async () => {
    if (!newChannelId) return;
    const res = await request
      .delete(`/api/channels/${newChannelId}`)
      .set('Authorization', `Bearer ${getToken()}`);

    expect(res.status).toBe(200);
  });
});
