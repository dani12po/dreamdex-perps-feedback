# Paper USDso: docs say leverage "can't be changed" while the voucher remains, but `setMaxLeverage` succeeds for voucher accounts
Severity: normal
Area: contracts

## Steps to reproduce
1. Read [Margin & Liquidations → Paper USDso](https://app.testnet.dreamdex.io/docs/trading/perps-testnet/margin-and-liquidations#paper-usdso): while any voucher remains, "**Your leverage setting can't be changed**".
2. Take accounts with an active voucher. `MarginBank.getCreditFloor(account)` > 0: `0xEa4949836C967D275bdd093f38682DAbcCEF7BDd` (1,000 USDso) and `0xEB7eeD442dCfAB38A6F591005A0ddF054bc4f7e6` (2,000 USDso). Both hold open positions.
3. Simulate `MarginBank(0x478769E1177C0773c43A593DCCc4Ad15F15F1394).setMaxLeverage(ETH-PERP pool 0xd6cb1dd58580b84d76068ac21594219ce03aeddf, L)` from each account with `eth_call` for L = 2, 5, 10 (this is the call `trader.setPerpLeverage` sends). Script: `scripts/ev_lev.ts`.

## Expected
The call reverts (a voucher-lock error) while the credit floor is > 0, as documented. Or the docs say what is actually restricted.

## Actual
Every call returns success (`"result":"0x"`) at block 33224786 for both voucher accounts. Only L = 21 (above the protocol's 20x) reverts (`0x7fd13972`). A fresh account with no voucher behaves the same. Either the lock is not enforced, which matters for Perps Arena fairness (the credit's 20x cap is the only limit), or the docs are wrong and the app or bots can change leverage freely.

Caveat: this is an `eth_call` simulation from the voucher holders' addresses. I had no funded voucher account to send a real transaction (see README, blocker). The simulation runs the same contract code at the same block.

## Evidence
- `evidence/07-setMaxLeverage-eth_call-voucher-accounts.txt`: `getCreditFloor` per account, plus the full JSON-RPC requests and responses.

## Environment
- SDK: `@somnia-chain/markets-sdk` 0.32.1 (npm `latest`), viem 2.x, Node 22
- Network: Somnia Tokyo testnet, chain ID 50383 (Hideki, RPC `https://api.hideki2.infra.testnet.somnia.network`, indexer `https://hideki-dev.smk.somnia.host/v1/graphql`)
- Tester wallet (testnet only, unfunded): `0x365793549966b12BD08B4B2B43915dD129A2dAF9`
- Checked: 2026-10-26 (UTC)
