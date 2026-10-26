# Bot kit: `perp-core` is pinned to markets-sdk `^0.31.0`, which lacks the voucher and Hideki-address APIs the developer page uses
Severity: normal
Area: SDK

## Steps to reproduce
1. `git clone https://github.com/somnia-chain/dreamdex-bot-kit` (main @ `2579866`, 2026-10-12) and run `npm install`.
2. `packages/perp-core/package.json` declares `"@somnia-chain/markets-sdk": "^0.31.0"`. Under 0.x semver that is `>=0.31.0 <0.32.0`, and `package-lock.json` resolves it to **0.31.0**.
3. From `packages/perp-core`, run `scripts/check-botkit-sdk-version.mts`. It imports the SDK the way the developer page's "Connect" and "Get test funds" snippets do.

## Expected
The bot kit, which the developer page links as the reference for perps bots ("the bot kit sends every perp order with 10,000,000", "Trade an app wallet with a bot"), runs the SDK version the page targets ("this page uses version 0.32.1, the one the app runs"), so its snippets work inside a bot kit strategy.

## Actual
```
SOMNIA_HIDEKI_TESTNET_ADDRESSES: undefined
trader.claimPerpVoucher: undefined | client.getPerpVoucherEligibility: undefined | client.getMaxPerpOrderSize: function
```
The same script against a clean `@somnia-chain/markets-sdk@0.32.1` install prints `object` / `function` / `function`. Pasting the page's `addresses: SOMNIA_HIDEKI_TESTNET_ADDRESSES` and `claimPerpVoucher` / `getPerpVoucherEligibility` code into `strategies/perp-*` fails with `undefined` / "is not a function", and the caret range can never pick up 0.32.x. The workspace also holds two copies of the SDK (root 0.30.0 for `ec-core`, 0.31.0 for `perp-core`).

Suggested fix: bump `perp-core` to `^0.32.1` (and regenerate the lockfile), or say on the developer page which snippets need 0.32.

## Evidence
- `evidence/04-botkit-perp-core-sdk-0.31.txt`: package.json range, lockfile entry and script output for 0.31.0 vs 0.32.1.

## Environment
- SDK: `@somnia-chain/markets-sdk` 0.32.1 (npm `latest`), viem 2.x, Node 22
- Network: Somnia Tokyo testnet, chain ID 50383 (Hideki, RPC `https://api.hideki2.infra.testnet.somnia.network`, indexer `https://hideki-dev.smk.somnia.host/v1/graphql`)
- Tester wallet (testnet only, unfunded): `0x365793549966b12BD08B4B2B43915dD129A2dAF9`
- Checked: 2026-10-26 (UTC)
- Bot kit: `somnia-chain/dreamdex-bot-kit` main @ `25798660bbe4674a6f83a960b202852896e2fed4`
