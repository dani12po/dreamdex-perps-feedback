import { createPublicClient, http, encodeFunctionData, decodeFunctionResult, parseAbi } from "viem"
const R="https://api.hideki2.infra.testnet.somnia.network"
const pc=createPublicClient({transport:http(R)})
const bank="0x478769E1177C0773c43A593DCCc4Ad15F15F1394"
const abi=parseAbi(["function getPosition(address account,address perpPool) view returns ((int128 size,uint128 avgEntryPrice,int256 entryFundingIndex,uint64 lastUpdatedTimestampNs))"])
const pairs=[["0x47537e3a3ea6e9391f3b26ea45618db6828c8bff","0xc410012e39765cd5f772e84bacb19554aec040df","DOGE"],["0x47537e3a3ea6e9391f3b26ea45618db6828c8bff","0x4181dd08e73bbcdd1ba3e615a18f6abd941b94c0","BTC"],["0xEB7eeD442dCfAB38A6F591005A0ddF054bc4f7e6","0x2a1822b02039ddf0e293f3f7243673fc03eaf16c","ZRO"]]
const bn=await pc.getBlockNumber(); const b=await pc.getBlock({blockNumber:bn})
console.log(`# eth_call MarginBank.getPosition at block ${bn} (timestamp ${b.timestamp})`)
for(const [a,p,s] of pairs){ const data=encodeFunctionData({abi,functionName:"getPosition",args:[a as any,p as any]}); const r=await pc.call({to:bank,data,blockNumber:bn}); const d:any=decodeFunctionResult({abi,functionName:"getPosition",data:r.data!})
 console.log(JSON.stringify({market:s,account:a,pool:p,request:{to:bank,data},rawResult:r.data,decoded:{size:d.size.toString(),avgEntryPrice:d.avgEntryPrice.toString(),entryFundingIndex:d.entryFundingIndex.toString(),lastUpdatedTimestampNs:d.lastUpdatedTimestampNs.toString()}},null,1)) }
