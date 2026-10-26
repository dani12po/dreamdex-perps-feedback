import { createPublicClient, http, encodeFunctionData } from "viem"
const pc=createPublicClient({transport:http("https://api.hideki2.infra.testnet.somnia.network")})
const bank="0x478769E1177C0773c43A593DCCc4Ad15F15F1394", eth="0xd6cb1dd58580b84d76068ac21594219ce03aeddf"
const abi=(await import("./node_modules/@somnia-chain/markets-sdk/dist/tradeAbi.js")).marginBankWriteAbi
for (const a of ["0xEa4949836C967D275bdd093f38682DAbcCEF7BDd","0xEB7eeD442dCfAB38A6F591005A0ddF054bc4f7e6","0x365793549966b12BD08B4B2B43915dD129A2dAF9"]) for (const L of [1,2,5,10,20,21]){
 const data=encodeFunctionData({abi,functionName:"setMaxLeverage",args:[eth,L]})
 const r=await fetch("https://api.hideki2.infra.testnet.somnia.network",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({jsonrpc:"2.0",id:1,method:"eth_call",params:[{from:a,to:bank,data},"latest"]})}).then(r=>r.json())
 console.log(a.slice(0,10),"L",L, r.error?("REVERT "+r.error.data):"OK")
}
