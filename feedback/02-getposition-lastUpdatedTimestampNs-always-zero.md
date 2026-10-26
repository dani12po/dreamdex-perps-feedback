# `MarginBank.getPosition().lastUpdatedTimestampNs` is always 0, even for positions changed seconds earlier
Severity: normal
Area: contracts

## Steps to reproduce
1. Take a position that just changed. `client.listPerpPositionChanges({ limit: 5 })` returned, for example, account `0x47537e3a3ea6e9391f3b26ea45618db6828c8bff` on DOGE-PERP (pool `0xc410012e39765cd5f772e84bacb19554aec040df`), REDUCE at block 33219126, tx `0x527ec1089af10920d1372520e819fb8e738517eac54cb937ec5a220e844f200a`.
2. `eth_call` MarginBank `0x478769E1177C0773c43A593DCCc4Ad15F15F1394` → `getPosition(account, pool)` (selector `0xb33dc190`), or call `client.getPerpPosition({ pool, marginBank, account })`.
3. Read the 4th word of the result.

## Expected
`lastUpdatedTimestampNs` is the time of the last position update in ns. The SDK type `PerpPosition` documents it as "Last position update (nanoseconds)", and the ABI exports it.

## Actual
The field is `0` on every open position checked: DOGE, BTC and ZRO, including the BTC position of the same account whose size changed between two of my reads (−8,723,566,000 → −8,744,143,000). Raw result for DOGE, last 32 bytes = 0:

```
0xfffffffffffffffffffffffffffffffffffffffffffffffffffff03ab775a800
  0000000000000000000000000000000000000000000000000111a8ae7e2956a5
  00000000000000000000000000000000000026994b6f74c12f5493fd8b482104
  0000000000000000000000000000000000000000000000000000000000000000
```

The other fields (size, avgEntryPrice, entryFundingIndex) are filled. The SDK passes the zero on unchanged (`perp/state.js`). A UI or bot that shows position age, or tells a fresh position from a stale one, gets 1970-01-01.

Suggested fix: write the timestamp in `settleTrade`/position updates. If it is unused by design, drop it from the struct, ABI and SDK type, or mark it deprecated/always 0.

## Evidence
- `evidence/02-getposition-lastUpdated-zero.txt`: requests (to + calldata), raw results and decoded tuples for 3 live positions at block 33224246.
- Script: `scripts/ev_position.ts`.

## Environment
- SDK: `@somnia-chain/markets-sdk` 0.32.1 (npm `latest`), viem 2.x, Node 22
- Network: Somnia Tokyo testnet, chain ID 50383 (Hideki, RPC `https://api.hideki2.infra.testnet.somnia.network`, indexer `https://hideki-dev.smk.somnia.host/v1/graphql`)
- Tester wallet (testnet only, unfunded): `0x365793549966b12BD08B4B2B43915dD129A2dAF9`
- Checked: 2026-10-26 (UTC)
