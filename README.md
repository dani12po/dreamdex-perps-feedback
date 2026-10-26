# dreamDEX Perps Builder Bounty — Feedback track

Reproducible feedback on dreamDEX perps (Somnia Tokyo testnet / Hideki, chain 50383), `@somnia-chain/markets-sdk` 0.32.1, the developer/trader docs, and `somnia-chain/dreamdex-bot-kit`.

One issue per file in [`feedback/`](feedback/), in the official format. Raw evidence (RPC requests/responses, logs, indexer rows, tx hashes) is in [`evidence/`](evidence/); the scripts that produced it are in [`scripts/`](scripts/).

| # | Title | Severity | Area |
|---|---|---|---|
| 01 | Funding docs: sign rule does not match chain; +0.01%/8h interest term and ±0.05% clamp undocumented | normal | docs |
| 02 | `MarginBank.getPosition().lastUpdatedTimestampNs` is always 0 | normal | contracts |
| 03 | SDK reports an unfunded signer as `ContractRevertError … Missing or invalid parameters` | normal | SDK |
| 04 | Bot kit `perp-core` pinned to markets-sdk ^0.31.0, missing APIs the developer page uses | normal | SDK |
| 05 | Bot kit `perp-starter` exits in DRY_RUN on an empty MarginBank; preflight ignores wallet auto-pull | normal | SDK |
| 06 | Docs disagree on where perp margin comes from (Perps account only vs wallet auto-pull) | normal | docs |
| 07 | Paper USDso: "leverage can't be changed" not enforced by `setMaxLeverage` | normal | contracts |

## Reproduce

```bash
cd scripts
npm install
# read-only scripts need no key; write scripts read PRIVATE_KEY from the environment (use a throwaway testnet key)
npx tsx fund2.ts          # 01
npx tsx ev_position.ts    # 02
PRIVATE_KEY=0x... npx tsx write0.ts && PRIVATE_KEY=0x... node raw.mjs   # 03 (unfunded key)
npx tsx pulls.ts          # 05, 06
npx tsx ev_lev.ts         # 07
```
Item 04 and 05 are reproduced inside a clone of `somnia-chain/dreamdex-bot-kit` (see each file).

## Scope notes
- Tested 2026-10-26 with a fresh, **unfunded** testnet wallet `0x365793549966b12BD08B4B2B43915dD129A2dAF9`. Hideki has no public STT faucet and the paper-USDso self-claim is disabled, so no orders were placed from it; everything here is read-only calls, `eth_call` simulations, and rejected-before-execution sends.
- Issues already reported publicly by other participants (voucher self-claim disabled, voucher allowlist vs docs, OI caps vs docs, errors page missing perp errors, Link-a-bot gas bootstrap, paper USDso once-vs-weekly, etc.) were deliberately left out.
- No security issues are included in this repo.
