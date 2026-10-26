import { SOMNIA_HIDEKI_TESTNET_ADDRESSES, SomniaMarkets } from "@somnia-chain/markets-sdk"
import { hidekiTestnet } from "@somnia-chain/markets-sdk/chains"
const m = new SomniaMarkets({ chain: hidekiTestnet, indexerUrl: "https://hideki-dev.smk.somnia.host/v1/graphql", addresses: SOMNIA_HIDEKI_TESTNET_ADDRESSES })
const c:any=m.client
const ps=await c.listPerpMarkets()
const now=Math.floor(Date.now()/1000)
for(const p of ps){ try{
 const s=await c.getPerpState(p.poolAddress); const r=await c.getPerpRiskParams(p.poolAddress)
 const f=(x:bigint)=>Number(x)/1e18
 console.log(p.baseSymbol.padEnd(9), "mark",f(s.markPrice).toPrecision(7),"ok",s.markPriceOk,"idx",f(s.indexPrice).toPrecision(7),"idxAge",now-Number(s.indexUpdatedAt),"s  rate%",(f(s.fundingRate)*100).toFixed(4),"ema%",(f(s.emaPremium)*100).toFixed(4),"diff%",((f(s.emaPremium)-f(s.fundingRate))*100).toFixed(4),"IM",r.initialMarginBps,"MM",r.maintenanceMarginBps,"OIcap",r.maxOpenInterest,"posCap",r.maxPositionSize, "ratio", Number(r.maxOpenInterest)/Number(r.maxPositionSize), "tick",p.tickSize,"lot",p.lotSize,"min",p.minQuantity,"bdec",p.baseDecimals,"OI",s.openInterest)
}catch(e:any){console.log(p.baseSymbol,"ERR",e.message?.slice(0,200))}}
process.exit(0)
