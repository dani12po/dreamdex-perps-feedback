# SDK: a write from a signer with no STT is reported as `ContractRevertError: … reverted: Missing or invalid parameters`, hiding the node's "account does not exist"
Severity: normal
Area: SDK

## Steps to reproduce
1. Create a new key and do not fund it (0 STT on chain 50383).
2. Build the client exactly as on [Perps on Testnet for Developers](https://app.testnet.dreamdex.io/docs/developers/perps-testnet) ("Connect"), with `privateKey`.
3. Run either documented write:
   - `await markets.trader.claimPerpVoucher({ marginBank: btc.marginBank })`
   - `await markets.trader.placePerpOrder({ pool: btc.poolAddress, isBid: true, price: parseUnits("100000", 18), quantity: parseUnits("0.001", 8) })`
4. Inspect the thrown error. Script: `scripts/write0.ts`.

## Expected
An error that says the signer cannot pay gas (insufficient funds / account has no STT), as a non-revert class (`RpcError` or similar) that keeps the node's message, ideally with the account's balance and the documented 0.6 STT write requirement.

## Actual
Both calls throw:

```
ContractRevertError: @somnia-chain/markets-sdk: claim reverted: Missing or invalid parameters.
Double check you have provided the correct parameters.
  cause: InvalidInputRpcError   errorName=undefined   data=0x02
```

(`placeOrder reverted: …` for the order.) Nothing reverted. Sending the same signed transaction raw over the same WebSocket returns:

```
{"jsonrpc":"2.0","id":1,"error":{"code":-32000,"message":"account does not exist","data":"0x02"}}
```

The SDK takes this pre-execution node rejection and (a) labels it a contract revert, (b) replaces the node's message with viem's generic "Missing or invalid parameters", and (c) puts `0x02` in `data`, where it looks like revert data. A developer following the docs with a new key is sent off to debug their order parameters. The node's own message ("account does not exist" rather than "insufficient funds for gas") also does not name the cause.

Suggested fix: map JSON-RPC `-32000` send rejections to a non-revert error that keeps the node message, and check the balance against `gas × maxFeePerGas` before sending (the SDK already knows the 0.6 STT requirement from its config docs).

## Evidence
- `evidence/03-sdk-unfunded-write-errors.txt`: the SDK errors for both writes, the raw `eth_sendRawTransaction` response, and `eth_getBalance` = 0x0 for the signer.
- Scripts: `scripts/write0.ts`, `scripts/raw.mjs` (signs locally from `PRIVATE_KEY`, nonce 0, gas 10M, 6 gwei).

## Environment
- SDK: `@somnia-chain/markets-sdk` 0.32.1 (npm `latest`), viem 2.x, Node 22
- Network: Somnia Tokyo testnet, chain ID 50383 (Hideki, RPC `https://api.hideki2.infra.testnet.somnia.network`, indexer `https://hideki-dev.smk.somnia.host/v1/graphql`)
- Tester wallet (testnet only, unfunded): `0x365793549966b12BD08B4B2B43915dD129A2dAF9`
- Checked: 2026-10-26 (UTC)
