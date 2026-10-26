import { createPublicClient, http, encodeFunctionData, parseAbi } from "viem"
const R="https://api.hideki2.infra.testnet.somnia.network"
const pc=createPublicClient({transport:http(R)})
const bank="0x478769E1177C0773c43A593DCCc4Ad15F15F1394", eth="0xd6cb1dd58580b84d76068ac21594219ce03aeddf"
const rd=parseAbi(["function getCreditFloor(address) view returns (uint256)","function getAccountMaxLeverage(address,address) view returns (uint16)"])
const wabi=(await import("./node_modules/@somnia-chain/markets-sdk/dist/tradeAbi.js")).marginBankWriteAbi
const bn=await pc.getBlockNumber()
console.log(`# block ${bn}. MarginBank ${bank}, ETH-PERP pool ${eth}`)
for (const a of ["0xEa4949836C967D275bdd093f38682DAbcCEF7BDd","0xEB7eeD442dCfAB38A6F591005A0ddF054bc4f7e6"]){
 const floor=await pc.readContract({address:bank,abi:rd,functionName:"getCreditFloor",args:[a as any],blockNumber:bn})
 console.log(`\naccount ${a}  getCreditFloor (active paper-USDso voucher) = ${floor} (${Number(floor)/1e18} USDso)`)
 for (const L of [2,5,10]){ const data=encodeFunctionData({abi:wabi,functionName:"setMaxLeverage",args:[eth,L]})
  const req={jsonrpc:"2.0",id:1,method:"eth_call",params:[{from:a,to:bank,data},"0x"+bn.toString(16)]}
  const r=await fetch(R,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(req)}).then(r=>r.json())
  console.log("request:",JSON.stringify(req)); console.log("response:",JSON.stringify(r)) }
}
