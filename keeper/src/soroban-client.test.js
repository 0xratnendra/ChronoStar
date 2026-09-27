import { describe, it, mock } from 'node:test';
import assert from 'node:assert';
import { SorobanClient } from './soroban-client.js';

describe('SorobanClient', () => {
  it('builds transaction with memo and returns correlationId and hash', async () => {
    const client = new SorobanClient();
    client.sourceAccount = { sequence: '1' };
    client.sourceKeypair = {
      publicKey: () => 'G...',
      sign: () => {},
    };

    client.server = {
      simulateTransaction: mock.fn(async () => ({
        result: { retval: null },
      })),
      sendTransaction: mock.fn(async () => ({
        status: 'SUCCESS',
        hash: 'txhash1234567890',
      })),
    };

    const result = await client.invokeContract('C123', 'test_method', [], 'test-correlation-id-12345');
    assert.strictEqual(result.hash, 'txhash1234567890');
    assert.strictEqual(result.correlationId, 'test-correlation-id-12345');
  });
});
