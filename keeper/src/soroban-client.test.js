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
import { describe, it, expect, vi } from 'vitest';
import { SorobanClient } from './soroban-client.js';

describe('SorobanClient', () => {
  it('refreshes source account sequence on submission failure', async () => {
    const client = new SorobanClient();
    let getAccountCalls = 0;

    client.sourceKeypair = {
      publicKey: () => 'GBANKKEY1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ1234',
      sign: vi.fn(),
    };

    client.server = {
      getAccount: vi.fn(async () => {
        getAccountCalls++;
        return { sequenceNumber: () => String(100 + getAccountCalls), sequence: String(100 + getAccountCalls) };
      }),
      simulateTransaction: vi.fn(async () => ({ error: 'sim_error' })),
    };

    client.sourceAccount = { sequenceNumber: () => '100', sequence: '100' };

    await expect(client.invokeContract('C123', 'test_method', [])).rejects.toThrow('test_method simulation failed: sim_error');
    expect(client.server.getAccount).toHaveBeenCalled();
    expect(getAccountCalls).toBeGreaterThan(0);
  });
});
