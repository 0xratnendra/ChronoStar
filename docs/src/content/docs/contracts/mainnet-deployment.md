---
title: Mainnet Deployment & Configuration Guide
description: Step-by-step guide for deploying ChronoStar smart contracts to Stellar Mainnet.
---

## Overview

This guide details the deployment of ChronoStar contracts (`ScheduleVault`, `RecurringStream`, `DCAPolicy`) to the Stellar Mainnet.

## Prerequisites

1. **Stellar CLI**: `stellar-cli` v21.0+ installed.
2. **Mainnet Account**: Funded deployer account with sufficient XLM for transaction fees and contract storage reserves.
3. **RPC Endpoint**: High-availability Soroban RPC provider (e.g., QuickNode, Blockdaemon, or self-hosted RPC node).

## Network Parameters

| Parameter | Mainnet Value |
|---|---|
| **Network Passphrase** | `Public Global Stellar Network ; September 2015` |
| **RPC URL** | `https://soroban-rpc.mainnet.stellar.org` (or private provider) |
| **Horizon URL** | `https://horizon.stellar.org` |

## Step 1: Configure Mainnet Network Profile

```bash
stellar network add mainnet \
  --rpc-url https://soroban-rpc.mainnet.stellar.org \
  --network-passphrase "Public Global Stellar Network ; September 2015"
```

## Step 2: Build Release WASM Binaries

Compile contracts with workspace optimization:

```bash
cd contract
cargo build --target wasm32-unknown-unknown --release
stellar contract optimize --wasm target/wasm32-unknown-unknown/release/schedule_vault.wasm
stellar contract optimize --wasm target/wasm32-unknown-unknown/release/recurring_stream.wasm
stellar contract optimize --wasm target/wasm32-unknown-unknown/release/dca_policy.wasm
```

## Step 3: Deploy Contracts to Mainnet

```bash
# Deploy ScheduleVault
stellar contract deploy \
  --wasm target/wasm32-unknown-unknown/release/schedule_vault.optimized.wasm \
  --source-account deployer \
  --network mainnet

# Deploy RecurringStream
stellar contract deploy \
  --wasm target/wasm32-unknown-unknown/release/recurring_stream.optimized.wasm \
  --source-account deployer \
  --network mainnet

# Deploy DCAPolicy
stellar contract deploy \
  --wasm target/wasm32-unknown-unknown/release/dca_policy.optimized.wasm \
  --source-account deployer \
  --network mainnet
```

## Step 4: Verification & Post-Deployment Checklist

1. Record deployed contract IDs.
2. Verify contract initialization parameters and admin addresses.
3. Update environment variables in backend and keeper node configurations (`.env.production`).
