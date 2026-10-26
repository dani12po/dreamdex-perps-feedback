import { SOMNIA_HIDEKI_TESTNET_ADDRESSES, SomniaMarkets } from "@somnia-chain/markets-sdk"
import { hidekiTestnet } from "@somnia-chain/markets-sdk/chains"
const m = new SomniaMarkets({ chain: hidekiTestnet, indexerUrl: "https://hideki-dev.smk.somnia.host/v1/graphql", addresses: SOMNIA_HIDEKI_TESTNET_ADDRESSES })
const c:any=m.client
try{ const r=await c.listPerpMarginPulls({limit:5}); console.log(JSON.stringify(r,(k,v)=>typeof v==='bigint'?v.toString():v,1).slice(0,2500)) }catch(e:any){console.log("ERR",e.message.slice(0,400))}
process.exit(0)
