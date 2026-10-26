# Funding docs: "perp below index → shorts pay longs" does not match the chain, which adds a +0.01%/8h interest term clamped at ±0.05%
Severity: normal
Area: docs

## Steps to reproduce
1. Read [Perps on Testnet → Funding](https://app.testnet.dreamdex.io/docs/trading/perps-testnet/funding): "Perp above the index (positive funding): longs pay shorts. Perp below the index (negative funding): shorts pay longs." No other term in the rate is mentioned.
2. For every perp pool from `client.listPerpMarkets()`, read `getEmaPremium()` and `getCurrentFundingRate()` in the same block (`client.getPerpState(pool)` does this). Script: `scripts/fund2.ts`.
3. Compare the rate with the premium.

## Expected
The funding rate has the sign of the premium (perp vs index), as the page says. If the rate has more terms, the page names them.

## Actual
In block 33223643, for all 21 markets the rate is exactly:

```
fundingRate = P + clamp(0.0001 − P, −0.0005, +0.0005)      (P = emaPremium, 1e18 = 100%)
```

So there is an interest term of +0.01% per 8 h window, clamped at ±0.05%, as on Binance-style perps. Because of it, **13 of 21 markets had a negative premium (the perp below the index) and still a positive rate (longs paid shorts)**. Two examples:
- NEAR-PERP: emaPremium −0.0092%, fundingRate +0.0100%
- ETH-PERP: emaPremium −0.0392%, fundingRate +0.0100%

When the premium is flat, the market sits at +0.01% per 8 h (≈10.95%/yr; `npm run perp:doctor` in the bot kit prints exactly "funding 10.950% (pays shorts)" for 19 markets). The page leaves this out, as well as the clamp and the fact that the premium is an EMA and not the mark price. On BTC-PERP the **mark** was below the index while the premium was +0.162%.

The settlement rule on the page is correct. Over 6 hourly settlements on BTC-PERP, Δ`cumulativeFundingPerUnit` = rate × index / 8 within 1–4% (`evidence/01-funding-hourly-settlement-check.txt`). Only the sign and composition of the rate are wrong.

Impact: a trader or a funding bot that follows the page expects to be paid as a long when the perp trades under the index. On most markets it pays.

Suggested fix: document the rate as `premium + clamp(interest − premium, −cap, +cap)` with interest 0.01% and cap 0.05% per 8 h. Say that the premium is a time-weighted EMA of the book vs the index, not mark minus index. Expose the interest and the cap as a read, or give their source.

## Evidence
- `evidence/01-funding-snapshot.json`: all 21 markets with markPrice, indexPrice, emaPremium, fundingRate, the formula prediction (`formulaExactMatch: true` for 21/21) and `premiumNegativeButLongsPay` (13/21).
- `evidence/01-funding-hourly-settlement-check.txt`: 6 settlements on BTC-PERP (pool `0x4181dd08e73bbcdd1ba3e615a18f6abd941b94c0`) read at historical blocks.
- Pool reads: `getEmaPremium()`, `getCurrentFundingRate()`, `getIndexPrice()`, `tryGetMarkPrice()` via `eth_call`.

## Environment
- SDK: `@somnia-chain/markets-sdk` 0.32.1 (npm `latest`), viem 2.x, Node 22
- Network: Somnia Tokyo testnet, chain ID 50383 (Hideki, RPC `https://api.hideki2.infra.testnet.somnia.network`, indexer `https://hideki-dev.smk.somnia.host/v1/graphql`)
- Tester wallet (testnet only, unfunded): `0x365793549966b12BD08B4B2B43915dD129A2dAF9`
- Checked: 2026-10-26 (UTC)
