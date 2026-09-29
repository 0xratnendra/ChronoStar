---
title: Good-First-Issue Onboarding Curriculum
description: A step-by-step guide for first-time Stellar & Soroban contributors joining ChronoStar Protocol.
---

Welcome to the **ChronoStar Protocol** contributor curriculum! This guide is designed to take you from a fresh clone of the repository to your first merged pull request.

---

## 1. Setup Verification Checklist

Before picking an issue, verify that your local development environment has the required toolchains:

- [ ] **Node.js**: `node -v` (v20+ required)
- [ ] **Rust & Cargo**: `rustc --version` (1.78+ required with `wasm32-unknown-unknown` target)
- [ ] **Soroban CLI**: `soroban --version`
- [ ] **Docker Engine**: `docker --version` (required for local devnet testing)
- [ ] **Git & GitHub CLI**: `gh auth status` (authenticated to GitHub)

### Quick Environment Check Command
```bash
node -v && rustc --version && soroban --version && docker --version
```

---

## 2. Starter Tasks by Difficulty

Select a starter task matching your area of interest and experience:

| Issue | Title | Workspace | Complexity | Focus Area |
| ----- | ----- | --------- | ---------- | ---------- |
| **[#176](https://github.com/Chronostar-Protocol/ChronoStar/issues/176)** | Add shared Prettier config across all workspaces | Root / Workspace Config | Light | DevEx / Code formatting |
| **[#174](https://github.com/Chronostar-Protocol/ChronoStar/issues/174)** | Add uptime monitoring for backend & keeper endpoints | Infra / CI | Light | Monitoring / Health checks |
| **[#177](https://github.com/Chronostar-Protocol/ChronoStar/issues/177)** | Add good-first-issue onboarding curriculum | Docs / Community | Light | Documentation |
| **[#175](https://github.com/Chronostar-Protocol/ChronoStar/issues/175)** | Add client-side error monitoring with Sentry | Frontend / Next.js | Medium | Frontend telemetry & error handling |

---

## 3. End-to-End Walkthrough of a Real Merged Change

Here is an example walkthrough based on merged PR **#172** (*"Fix decimal formatting in vault deposit modal"*):

1. **Find & Assign**: Comment on the issue asking to be assigned.
2. **Branch Creation**:
   ```bash
   git checkout master
   git pull upstream master
   git checkout -b fix/vault-deposit-decimals
   ```
3. **Implementation**:
   - Locate the component in `frontend/src/components/VaultDepositModal.tsx`.
   - Update string-to-stroop conversion logic using `BigInt` to prevent floating-point rounding errors.
4. **Verification**:
   ```bash
   cd frontend
   npm run test
   ```
5. **Commit & Push**:
   ```bash
   git add frontend/src/components/VaultDepositModal.tsx
   git commit -m "fix(frontend): handle high-precision decimals in deposit input"
   git push origin fix/vault-deposit-decimals
   ```
6. **Open PR**: Open a PR with linked issue (`Closes #172`) following the PR template.

---

## 4. Troubleshooting Common First-PR Failures

### `cargo test` fails with missing `wasm32` target
Run:
```bash
rustup target add wasm32-unknown-unknown
```

### Prettier / Formatting CI Failure
Run:
```bash
npm run format
```

### Git commit author mismatch
Ensure your local git user info matches your GitHub profile:
```bash
git config --local user.name "Your Name"
git config --local user.email "your.email@example.com"
```

### Soroban RPC connection timeout in tests
Ensure your local Soroban network container is healthy:
```bash
docker ps
```
