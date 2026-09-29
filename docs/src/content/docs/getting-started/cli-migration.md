---
title: Stellar CLI Migration Guide
description: Migrate from deprecated soroban CLI to stellar CLI.
---

## Overview

The legacy `soroban-cli` crate has been unified into the official `stellar-cli`. All ChronoStar contracts, deployment scripts, and development workflows should now use `stellar-cli`.

## Installation

Replace `soroban-cli` installation with `stellar-cli`:

```bash
# Uninstall deprecated CLI (if installed)
cargo uninstall soroban-cli

# Install stellar CLI
cargo install --locked stellar-cli
```

## Command Mapping

| Legacy `soroban` Command | New `stellar` Command |
|---|---|
| `soroban contract deploy` | `stellar contract deploy` |
| `soroban contract invoke` | `stellar contract invoke` |
| `soroban contract build` | `stellar contract build` |
| `soroban config network add` | `stellar network add` |
| `soroban config identity generate` | `stellar keys generate` |

## Configuring Networks

Add Stellar Testnet configuration:

```bash
stellar network add testnet \
  --rpc-url https://soroban-testnet.stellar.org \
  --network-passphrase "Test SDF Network ; September 2015"
```

## Deploying Contracts with `stellar-cli`

```bash
stellar contract deploy \
  --wasm target/wasm32-unknown-unknown/release/schedule_vault.wasm \
  --source-account alice \
  --network testnet
```
