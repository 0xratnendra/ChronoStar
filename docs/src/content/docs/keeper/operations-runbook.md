---
title: Keeper Operations Runbook
description: Production operations runbook for running ChronoStar keeper nodes.
---

## Overview

ChronoStar keepers monitor on-chain schedules across `ScheduleVault`, `RecurringStream`, and `DCAPolicy` contracts, executing pending actions (`release`, `tick`, `execute_swap`) as soon as target ledgers are reached.

## Environment Setup

Create `.env` inside the `keeper/` directory:

```env
NODE_ENV=production
STELLAR_NETWORK_PASSPHRASE="Public Global Stellar Network ; September 2015"
SOROBAN_RPC_URL="https://soroban-rpc.mainnet.stellar.org"
KEEPER_SECRET_KEY="S..."
POLL_INTERVAL_MS=15000
MAX_FEE_STROOPS=100000
```

## Systemd Service Configuration

Deploy `/etc/systemd/system/chronostar-keeper.service`:

```ini
[Unit]
Description=ChronoStar Keeper Service
After=network.target

[Service]
Type=simple
User=chronostar
WorkingDirectory=/opt/chronostar/keeper
ExecStart=/usr/bin/npm start
Restart=always
RestartSec=5
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

Enable and start service:

```bash
sudo systemctl daemon-reload
sudo systemctl enable chronostar-keeper
sudo systemctl start chronostar-keeper
```

## Monitoring & Health Checks

- **Health Endpoint**: `http://localhost:8080/health` (returns `200 OK` when active).
- **Log Inspection**: `journalctl -u chronostar-keeper -f -o cat`
- **Key Metrics**:
  - `keeper_balance_xlm`: Keeper account native XLM balance (alert if < 50 XLM).
  - `pending_executions`: Number of vaults eligible for release.
  - `execution_latency_ledgers`: Delay between target release ledger and actual on-chain transaction submission.

## Incident Response & Outages

1. **RPC Rate Limits / 429 Errors**: Switch `SOROBAN_RPC_URL` to secondary failover endpoint.
2. **Keeper Out of Funds**: Transfer XLM to keeper public key to cover transaction fees.
3. **High Fee Spike**: Increase `MAX_FEE_STROOPS` parameter during network congestion.
