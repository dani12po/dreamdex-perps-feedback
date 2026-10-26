import {
  SOMNIA_HIDEKI_TESTNET_ADDRESSES,
  SomniaMarkets,
} from "@somnia-chain/markets-sdk"
import { hidekiTestnet } from "@somnia-chain/markets-sdk/chains"

const markets = new SomniaMarkets({
  chain: hidekiTestnet,
  indexerUrl: "https://hideki-dev.smk.somnia.host/v1/graphql",
  addresses: SOMNIA_HIDEKI_TESTNET_ADDRESSES,
  privateKey: process.env.PRIVATE_KEY as `0x${string}`, // leave out for read-only
})

const perps = await markets.client.listPerpMarkets()
console.log("count", perps.length)
const btc = perps.find((m) => m.baseSymbol === "BTC")!
console.log(JSON.stringify(btc, (k,v)=>typeof v==='bigint'?v.toString():v, 2))
console.log(JSON.stringify(perps.map(m=>[m.symbol??m.baseSymbol,m.baseDecimals,m.quoteDecimals]),null,0))
process.exit(0)
