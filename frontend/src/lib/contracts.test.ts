import { describe, it, expect, vi } from 'vitest';
import { createVaultTx } from './contracts';

describe('createVaultTx', () => {
  const sender = 'GBANKKEY1234567890';
  const validParams = {
    recipient: 'GRECIPIENT1234567890',
    token: 'CTOKEN1234567890',
    amount: '1000',
    releaseLedger: '2000000',
    label: 'Test Vault',
  };

  it('builds, simulates, and signs transaction via Freighter signer', async () => {
    const signerMock = vi.fn(async () => 'SIGNED_XDR_DATA');
    const result = await createVaultTx(sender, validParams, { signer: signerMock });

    expect(result.hash).toContain('vault-tx-');
    expect(signerMock).toHaveBeenCalledWith({
      xdr: expect.any(String),
      networkPassphrase: expect.any(String),
    });
  });

  it('surfaces simulation errors verbatim when release_ledger is invalid', async () => {
    await expect(
      createVaultTx(sender, { ...validParams, releaseLedger: '0' }),
    ).rejects.toThrow('release_ledger must be in the future');
  });

  it('surfaces amount validation error when amount <= 0', async () => {
    await expect(
      createVaultTx(sender, { ...validParams, amount: '0' }),
    ).rejects.toThrow('amount must be greater than zero');
  });
});
