import { describe, it } from 'node:test';
import assert from 'node:assert';
import express from 'express';
import request from 'supertest';
import { createLiveStreamRouter } from './live-stream.js';

describe('Live Stream SSE Router', () => {
  it('GET /api/stream sets SSE headers and streams updates', async () => {
    const clients = {
      vault: {
        client: {
          readContract: async () => 5,
        },
        contractId: 'C...',
      },
    };

    const app = express();
    app.use('/api/stream', createLiveStreamRouter(clients, undefined, 100));

    const res = await request(app)
      .get('/api/stream')
      .expect('Content-Type', /text\/event-stream/)
      .expect(200);

    assert.strictEqual(res.headers['cache-control'], 'no-cache');
    assert.strictEqual(res.headers['connection'], 'keep-alive');
    assert.strictEqual(res.text.includes(': connected'), true);
    assert.strictEqual(res.text.includes('event: schedule-update'), true);
  });
});
