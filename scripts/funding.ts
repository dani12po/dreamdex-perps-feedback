import { createPublicClient, http, parseAbi } from "viem"
const rpc="https://api.hideki2.infra.testnet.somnia.network"
const c=createPublicClient({transport:http(rpc)})
const pool=(process.argv[2]||"0x4181dd08e73bbcdd1ba3e615a18f6abd941b94c0") as `0x${string}`
const abi=parseAbi(["function getCurrentFundingRate() view returns (int256)","function getCumulativeFundingPerUnit() view returns (int256)","function getIndexPrice() view returns (uint256,uint256)","function getLastFundingUpdateTimestampNs() view returns (uint64)","function getEmaPremium() view returns (int256)"])
const head=await c.getBlockNumber()
const hb=await c.getBlock({blockNumber:head})
const old=await c.getBlock({blockNumber:head-360000n})
const bps=Number(360000n)/Number(hb.timestamp-old.timestamp)
console.log("head",head,"blocks/sec",bps.toFixed(2))
let prev:any=null
for(let h=6;h>=0;h--){
  const bn=head-BigInt(Math.round(h*3600*bps))
  try{
  const [r,cum,idx,last,ema]=await Promise.all(["getCurrentFundingRate","getCumulativeFundingPerUnit","getIndexPrice","getLastFundingUpdateTimestampNs","getEmaPremium"].map(f=>c.readContract({address:pool,abi,functionName:f as any,blockNumber:bn})))
  const row={bn,last:(last as bigint)/1000000000n,rate:r,cum,idx:(idx as any)[0],ema}
  if(prev && prev.last!==row.last){ const d=(row.cum as bigint)-(prev.cum as bigint); const expected=(prev.rate as bigint)*(prev.idx as bigint)/8n/10n**18n; console.log(" dCum",d.toString()," prevRate*idx/8(1e18 scaled)",expected.toString(), " ratio", Number(d)/Number(expected)) }
  console.log(JSON.stringify(row,(k,v)=>typeof v==='bigint'?v.toString():v)); prev=row
  }catch(e:any){console.log("ERR",bn,e.shortMessage||e.message)}
}
