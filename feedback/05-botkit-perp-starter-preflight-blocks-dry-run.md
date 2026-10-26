# Bot kit: `perp-starter` exits in DRY_RUN when the MarginBank is empty, and its preflight rejects owner accounts the pool would auto-fund from the wallet
Severity: normal
Area: SDK

## Steps to reproduce
1. In `dreamdex-bot-kit` (main @ `2579866`): `NETWORK=hideki DRY_RUN=true PERP_SYMBOL=ETH-PERP PERP_NOTIONAL_USDSO=20 PRIVATE_KEY=<new key> npm start -w perp-starter` (no `OWNER_ADDRESS`).
2. Watch the output and the exit code.

## Expected
The README and `.env.example` say DRY_RUN is the safe preview ("logs exactly what it would do without sending anything"; the source comment: "DRY_RUN=true (the default) logs intended orders without sending them"). A dry run should show the would-be leverage, size and bracket even when the account is not funded yet. That is the point of running it before funding. The link check already does this (`if (!link.ok && !ctx.config.dryRun) process.exit(1)`).

## Actual
```
perp-starter on ETH-PERP (ETH/USDso:USDso) | long 20 USDso at 2x | take-profit 2% stop-loss 1% | dry-run true
MarginBank is empty for 0x3657…dAF9. Deposit collateral before trading: every perp order locks from the bank, not from your wallet, so an unfunded account fails every order. Approve the MarginBank (0x478769e1…1394) as spender on the collateral token, then deposit.
npm error Lifecycle script `start` failed … code 1
```
`strategies/perp-starter/src/index.ts` calls `if (!check.ok) process.exit(1);` with no `dryRun` exception. So nothing past the preflight (leverage, `getMaxPerpOrderSize` sizing, bracket prices) can be previewed without funds.

The message's claim is also not true for an owner account (the mode this run uses). The chain auto-pulls the shortfall from the owner's wallet. The indexer has `PerpMarginPull` rows with `source: "OwnWallet"`, for example 49.914 USDso pulled for a BTC-PERP order in tx `0x2ba1832c71d470f94c17a5dfdf7d06bdb7e371ad8eae51e877f283c673c388e2` (block 33055063). The developer page and the SDK's `getMaxPerpOrderSize` TSDoc (`autoPull`) say the same. A wallet-funded, approved owner account with an empty bank is therefore refused by `preflight()` (`packages/perp-core/src/margin.ts`, `equity === 0n && unlocked === 0n`) even though its orders would succeed.

Suggested fix: in dry-run, print the preflight result and continue. In owner mode, count the wallet's pullable USDso (balance and allowance, or `getMaxPerpOrderSize({ autoPull: true })`) before declaring the account unfunded, and reword the message.

## Evidence
- `evidence/05-perp-starter-dry-run.txt`: full run log (key redacted).
- `evidence/05-perp-doctor.txt`: `npm run perp:doctor` for the same key ("empty bank: approve the MarginBank and deposit collateral").
- `evidence/06-perp-margin-pulls-ownwallet.json`: `client.listPerpMarginPulls({ limit: 5 })` showing `OwnWallet` pulls.

## Environment
- SDK: `@somnia-chain/markets-sdk` 0.32.1 (npm `latest`), viem 2.x, Node 22
- Network: Somnia Tokyo testnet, chain ID 50383 (Hideki, RPC `https://api.hideki2.infra.testnet.somnia.network`, indexer `https://hideki-dev.smk.somnia.host/v1/graphql`)
- Tester wallet (testnet only, unfunded): `0x365793549966b12BD08B4B2B43915dD129A2dAF9`
- Checked: 2026-10-26 (UTC)
- Bot kit: `somnia-chain/dreamdex-bot-kit` main @ `25798660bbe4674a6f83a960b202852896e2fed4`
