---
title: Lodestar Agent Auto-Pay Integration Guide
description: Fully worked example of integrating Lodestar AI agents with ChronoStar auto-payments.
---

## Overview

This guide demonstrates how autonomous AI agents (powered by the Lodestar SDK) schedule, manage, and verify automated recurring payments on Soroban using ChronoStar smart contracts.

## Integration Architecture

```
[Lodestar Agent]
       │
       ▼
[ChronoStar SDK / Stellar SDK]
       │
       ▼
[ScheduleVault Contract] ──(Target Ledger)──► [Recipient Address]
```

## Node.js / TypeScript Example

```typescript
import { Keypair, Contract, Address, rpc, xdr } from "@stellar/stellar-sdk";

export interface CreateAutoPayVaultOptions {
  vaultContractId: string;
  recipientAddress: string;
  tokenAddress: string;
  amountBaseUnits: bigint;
  releaseLedger: number;
  label: string;
  agentKeypair: Keypair;
  server: rpc.Server;
  networkPassphrase: string;
}

export async function scheduleLodestarAutoPay(options: CreateAutoPayVaultOptions): Promise<string> {
  const {
    vaultContractId,
    recipientAddress,
    tokenAddress,
    amountBaseUnits,
    releaseLedger,
    label,
    agentKeypair,
    server,
    networkPassphrase,
  } = options;

  const contract = new Contract(vaultContractId);
  const agentAddress = agentKeypair.publicKey();

  const account = await server.getAccount(agentAddress);
  const tx = contract.call(
    "create_vault",
    new Address(agentAddress).toScVal(),
    new Address(recipientAddress).toScVal(),
    new Address(tokenAddress).toScVal(),
    xdr.ScVal.scvI128(new xdr.Int128Parts({
      lo: xdr.Uint64.fromString((amountBaseUnits & 0xffffffffffffffffn).toString()),
      hi: xdr.Int64.fromString((amountBaseUnits >> 64n).toString()),
    })),
    xdr.ScVal.scvU32(releaseLedger),
    xdr.ScVal.scvString(label),
  );

  tx.setNetworkPassphrase(networkPassphrase);
  tx.setTimeout(30);

  const preparedTx = await server.prepareTransaction(tx);
  preparedTx.sign(agentKeypair);

  const response = await server.sendTransaction(preparedTx);
  if (response.status === "PENDING") {
    return response.hash;
  }
  throw new Error(`Transaction submission failed: ${JSON.stringify(response)}`);
}
```

## Verifying Auto-Payment Status

```typescript
export async function getVaultDetails(server: rpc.Server, vaultContractId: string, vaultId: number) {
  const contract = new Contract(vaultContractId);
  const tx = contract.call("get_vault", xdr.ScVal.scvU64(xdr.Uint64.fromString(vaultId.toString())));
  const sim = await server.simulateTransaction(tx);
  return sim.result?.retval;
}
```
