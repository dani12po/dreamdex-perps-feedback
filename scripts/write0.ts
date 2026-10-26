import { SOMNIA_HIDEKI_TESTNET_ADDRESSES, SomniaMarkets } from "@somnia-chain/markets-sdk"
import { hidekiTestnet } from "@somnia-chain/markets-sdk/chains"
import { parseUnits } from "viem"
const markets = new SomniaMarkets({ chain: hidekiTestnet, indexerUrl: "https://hideki-dev.smk.somnia.host/v1/graphql", addresses: SOMNIA_HIDEKI_TESTNET_ADDRESSES, privateKey: process.env.PRIVATE_KEY as `0x${string}` })
const perps = await markets.client.listPerpMarkets()
const btc = perps.find((m) => m.baseSymbol === "BTC")!
const account = markets.walletAddress!
const scrub=(s:string)=>s.split(process.env.PRIVATE_KEY!.slice(2)).join("<redacted>")
async function t(n:string,f:()=>Promise<any>){try{const r=await f();console.log("OK",n,JSON.stringify(r,(k,v)=>typeof v==='bigint'?v.toString():v).slice(0,600))}catch(e:any){console.log("ERR",n,e?.constructor?.name, e?.code??'', scrub(String(e?.message)).slice(0,900)); if(e?.cause) console.log("  cause:",e.cause?.constructor?.name, scrub(String(e.cause?.shortMessage||e.cause?.message)).slice(0,500))}}
await t("claimPerpVoucher(0 STT)", ()=>markets.trader.claimPerpVoucher({ marginBank: btc.marginBank }))
await t("placePerpOrder(doc example, empty account)", ()=>markets.trader.placePerpOrder({ pool: btc.poolAddress, isBid: true, price: parseUnits("100000", btc.quoteDecimals), quantity: parseUnits("0.001", btc.baseDecimals) }))
process.exit(0)
