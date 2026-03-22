/**
 * Tests for the Messages module — CRUD, reactions, and DM messages.
 *
 * Seed data: messages m1–m26 across channels and DMs.
 */
const { request, getToken, ensureInit } = require('./setup');

beforeAll(() => ensureInit(), 30000);

describe('Messages — GET /api/messages/channels/:channelId', () => {
  test('returns messages for a seeded channel', async () => {
    const res = await request
      .get('/api/messages/channels/c1')
      .set('Authorization', `Bearer ${getToken()}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.messages.length).toBeGreaterThanOrEqual(10);
  });
});

describe('Messages — GET /api/messages/dm/:dmId', () => {
  test('returns messages for a seeded DM', async () => {
    const res = await request
      .get('/api/messages/dm/dm1')
      .set('Authorization', `Bearer ${getToken()}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.messages.length).toBeGreaterThanOrEqual(3);
  });
});

describe('Messages — POST / PUT / DELETE', () => {
  let newMsgId;

  test('POST /api/messages creates a message in a channel', async () => {
    const res = await request
      .post('/api/messages')
      .set('Authorization', `Bearer ${getToken()}`)
      .send({ content: 'Automated test message', channelId: 'c1' });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    newMsgId = res.body.data.message.id;
    expect(newMsgId).toBeDefined();
  });

  test('PUT /api/messages/:messageId edits the message', async () => {
    if (!newMsgId) return;
    const res = await request
      .put(`/api/messages/${newMsgId}`)
      .set('Authorization', `Bearer ${getToken()}`)
      .send({ content: 'Edited test message' });

    expect(res.status).toBe(200);
    expect(res.body.data.message.content).toBe('Edited test message');
  });

  test('POST /api/messages/:messageId/reactions/toggle adds a reaction', async () => {
    if (!newMsgId) return;
    const res = await request
      .post(`/api/messages/${newMsgId}/reactions/toggle`)
      .set('Authorization', `Bearer ${getToken()}`)
      .send({ emoji: '👍' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test('DELETE /api/messages/:messageId deletes the message', async () => {
    if (!newMsgId) return;
    const res = await request
      .delete(`/api/messages/${newMsgId}`)
      .set('Authorization', `Bearer ${getToken()}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
