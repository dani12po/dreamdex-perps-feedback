import { SOMNIA_HIDEKI_TESTNET_ADDRESSES, SomniaMarkets } from "@somnia-chain/markets-sdk"
import { hidekiTestnet } from "@somnia-chain/markets-sdk/chains"
import { createPublicClient, http } from "viem"
const pc=createPublicClient({transport:http("https://api.hideki2.infra.testnet.somnia.network")})
const m = new SomniaMarkets({ chain: hidekiTestnet, indexerUrl: "https://hideki-dev.smk.somnia.host/v1/graphql", addresses: SOMNIA_HIDEKI_TESTNET_ADDRESSES })
const c:any=m.client
const ps=await c.listPerpMarkets()
const E=10n**18n, I=10n**14n /*0.01%*/, CL=5n*10n**14n /*0.05%*/
const clamp=(x:bigint,lo:bigint,hi:bigint)=>x<lo?lo:x>hi?hi:x
const out:any[]=[]; let fit=0, contra=0
for(const p of ps){ const s=await c.getPerpState(p.poolAddress); const prem=await c.getPerpFundingPremium(p.poolAddress)
 const pred = s.emaPremium + clamp(I - s.emaPremium, -CL, CL)
 const ok = pred===s.fundingRate; if(ok) fit++
 const markBelow = s.markPrice < s.indexPrice
 const premNeg = s.emaPremium < 0n
 const c1 = premNeg && s.fundingRate>0n; if(c1) contra++
 out.push({sym:p.baseSymbol,pool:p.poolAddress,markPrice:s.markPrice.toString(),indexPrice:s.indexPrice.toString(),emaPremium:s.emaPremium.toString(),fundingRate:s.fundingRate.toString(),predicted_ema_plus_clamp:pred.toString(),formulaExactMatch:ok,markBelowIndex:markBelow,premiumNegativeButLongsPay:c1, lastObservedPremium:prem.lastObservedPremium.toString()})
}
const bn=await pc.getBlockNumber()
console.log(JSON.stringify({block:bn.toString(), blockTimestamp:(await pc.getBlock({blockNumber:bn})).timestamp.toString(), markets:out.length, formulaExactMatches:fit, negativePremiumPositiveFunding:contra},null,0))
;for(const o of out) console.log(o.sym.padEnd(9),"ema%",(Number(o.emaPremium)/1e16).toFixed(4),"rate%",(Number(o.fundingRate)/1e16).toFixed(4),"fit",o.formulaExactMatch,"mark<index",o.markBelowIndex,"negPrem&longsPay",o.premiumNegativeButLongsPay)
;(await import("fs")).writeFileSync("funding_snapshot.json",JSON.stringify({block:bn.toString(),blockTimestamp:(await pc.getBlock({blockNumber:bn})).timestamp.toString(),rows:out},null,2))
process.exit(0)
