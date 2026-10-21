import { describe, it, mock } from 'node:test';
import assert from 'node:assert/strict';
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

  it('refreshes source account sequence on submission failure', async () => {
    const client = new SorobanClient();
    let getAccountCalls = 0;

    client.sourceKeypair = {
      publicKey: () => 'GBANKKEY1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ1234',
      sign: mock.fn(),
    };

    client.server = {
      getAccount: mock.fn(async () => {
        getAccountCalls++;
        return { sequenceNumber: () => String(100 + getAccountCalls), sequence: String(100 + getAccountCalls) };
      }),
      simulateTransaction: mock.fn(async () => ({ error: 'sim_error' })),
    };

    client.sourceAccount = { sequenceNumber: () => '100', sequence: '100' };

    await assert.rejects(
      async () => {
        await client.invokeContract('C123', 'test_method', []);
      },
      /test_method simulation failed: sim_error/
    );
    assert.strictEqual(getAccountCalls > 0, true);
  });
});
