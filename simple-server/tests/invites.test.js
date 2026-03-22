/**
 * Tests for the Server Invites module — send, accept, decline, list pending.
 *
 * Seed data: Ashraf (2) is NOT a member of Study Group (s3).
 * Salma (5) IS in s1 but NOT in s2 (Gaming Squad).
 */
const { request, getToken, login, ensureInit } = require('./setup');

beforeAll(() => ensureInit(), 30000);

describe('Invites — GET /api/invites/pending', () => {
  test('returns pending invites for the user', async () => {
    const res = await request
      .get('/api/invites/pending')
      .set('Authorization', `Bearer ${getToken()}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.invites).toBeInstanceOf(Array);
  });
});

describe('Invites — POST / accept / decline', () => {
  let inviteId;
  let targetToken;
  let targetId;
  let declineTargetToken;
  let declineTargetId;

  beforeAll(async () => {
    const a = `invitee${Date.now()}`;
    const aRes = await request.post('/api/auth/register').send({
      username: a, email: `${a}@test.com`, password: 'pass1234',
    });
    targetToken = aRes.body.data.token;
    targetId = aRes.body.data.user.id;

    const b = `decliner${Date.now()}`;
    const bRes = await request.post('/api/auth/register').send({
      username: b, email: `${b}@test.com`, password: 'pass1234',
    });
    declineTargetToken = bRes.body.data.token;
    declineTargetId = bRes.body.data.user.id;
  });

  test('POST /api/invites creates a server invite', async () => {
    const res = await request
      .post('/api/invites')
      .set('Authorization', `Bearer ${getToken()}`)
      .send({ serverId: 's1', toUserId: targetId });

    expect(res.status).toBe(201);
    inviteId = res.body.data.invite.id;
    expect(inviteId).toBeDefined();
  });

  test('POST /api/invites/:inviteId/accept adds user to server', async () => {
    if (!inviteId) return;
    const res = await request
      .post(`/api/invites/${inviteId}/accept`)
      .set('Authorization', `Bearer ${targetToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test('POST /api/invites — create then decline', async () => {
    const createRes = await request
      .post('/api/invites')
      .set('Authorization', `Bearer ${getToken()}`)
      .send({ serverId: 's1', toUserId: declineTargetId });

    expect(createRes.status).toBe(201);
    const id = createRes.body.data.invite.id;

    const declineRes = await request
      .post(`/api/invites/${id}/decline`)
      .set('Authorization', `Bearer ${declineTargetToken}`);

    expect(declineRes.status).toBe(200);
    expect(declineRes.body.success).toBe(true);
  });
});
