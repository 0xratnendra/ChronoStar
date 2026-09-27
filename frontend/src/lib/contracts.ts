import { signTransaction } from '@stellar/freighter-api';

export interface VaultParams {
  recipient: string;
  token: string;
  amount: string;
  releaseLedger: string;
  label?: string;
}

export async function createVaultTx(
  senderAddress: string,
  params: VaultParams,
  options?: { signer?: typeof signTransaction },
): Promise<{ hash: string }> {
  const signer = options?.signer || signTransaction;

  // Validate inputs
  const releaseNum = Number(params.releaseLedger);
  if (isNaN(releaseNum) || releaseNum <= 0) {
    throw new Error('release_ledger must be in the future');
  }

  const amountNum = Number(params.amount);
  if (isNaN(amountNum) || amountNum <= 0) {
    throw new Error('amount must be greater than zero');
  }

  // Simulate contract invocation
  try {
    const signedXdr = await signer({
      xdr: 'AAAA_SIMULATED_VAULT_CREATION_XDR',
      networkPassphrase: 'Test SDF Network ; July 2015',
    });

    if (!signedXdr) {
      throw new Error('User declined transaction signing');
    }

    return { hash: `vault-tx-${Date.now()}` };
  } catch (err: any) {
    throw new Error(err?.message || 'Transaction execution failed');
  }
}
