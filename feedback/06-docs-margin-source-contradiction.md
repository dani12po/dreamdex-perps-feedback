# Docs disagree on where perp margin comes from: "only the Perps account" vs the pool auto-pulling from the owner's wallet (which the chain does)
Severity: normal
Area: docs

## Steps to reproduce
1. Read the four official statements:
   - Trader guide, [Perps on Testnet → Get started](https://app.testnet.dreamdex.io/docs/trading/perps-testnet): "Perp orders only use margin that is already in the Perps account."
   - SDK how-to, [Get testnet funds → Perps](https://prd.smk.somnia.host/docs/typescript/how-to/get-testnet-funds): "Perp orders draw margin from the MarginBank, not from the wallet. After minting USDso, deposit it."
   - Bot kit preflight message (`packages/perp-core/src/margin.ts`): "every perp order locks from the bank, not from your wallet, so an unfunded account fails every order."
   - Developer guide, [Perps on Testnet for Developers](https://app.testnet.dreamdex.io/docs/developers/perps-testnet): "The owner's own `placeOrder` fails differently, with `ERC20: transfer amount exceeds balance`, because the pool tries to pull the shortfall from the wallet." The SDK TSDoc for `getMaxPerpOrderSize` says the same: "Pass `autoPull` when the transaction sender will be the order owner … an account with an empty bank and a funded, approved wallet goes from a max of `0n` to whatever the wallet funds."
2. Check the chain: `client.listPerpMarginPulls({ limit: 5 })`.

## Expected
One consistent rule: owner orders auto-pull the shortfall from the owner's (approved) wallet, and orders placed by a linked bot or operator (`placeOrderFor`) and stop orders do not. Every page states it.

## Actual
The chain auto-pulls. `PerpMarginPull` rows with `source: "OwnWallet"`, for example:
- tx `0x2ba1832c71d470f94c17a5dfdf7d06bdb7e371ad8eae51e877f283c673c388e2`: 49.914 USDso pulled for BTC-PERP order `21748711262903569055631`
- tx `0xe0e8d14882dae2f930934c4e10fe1bcc236297063275d95d5ba965e4962311e8`: 4.531 USDso for WLD-PERP

Three of the four sources say the opposite. The developer page's own sizing example also calls `getMaxPerpOrderSize` **without** `autoPull`, so an owner whose USDso sits in the wallet is told `placeable: false, limitedBy: "collateral"` for an order that would succeed. A new developer cannot tell whether to approve and keep USDso in the wallet, or deposit it first, and the bot kit enforces the wrong reading (see item 05).

Suggested fix: state the auto-pull rule (who it applies to, the approval it needs, that `placeOrderFor`, stops and linked bots never pull) on the trader page, the SDK how-to and in the bot kit message. Pass `autoPull: true` in the developer page's owner sizing example.

## Evidence
- `evidence/06-perp-margin-pulls-ownwallet.json`: indexer rows (account, pool, orderId, amount, txHash).
- Quotes above, from the linked pages as of 2026-10-26.

## Environment
- SDK: `@somnia-chain/markets-sdk` 0.32.1 (npm `latest`), viem 2.x, Node 22
- Network: Somnia Tokyo testnet, chain ID 50383 (Hideki, RPC `https://api.hideki2.infra.testnet.somnia.network`, indexer `https://hideki-dev.smk.somnia.host/v1/graphql`)
- Tester wallet (testnet only, unfunded): `0x365793549966b12BD08B4B2B43915dD129A2dAF9`
- Checked: 2026-10-26 (UTC)
