import { privateKeyToAccount } from "viem/accounts"
import WebSocket from "ws"
const acct=privateKeyToAccount(process.env.PRIVATE_KEY)
const tx={chainId:50383,type:"eip1559",to:"0x2ACD9EFdA721450906bfE1bef3edE269636E42C4",data:"0x4e71d92d",gas:10000000n,maxFeePerGas:6000000000n,maxPriorityFeePerGas:0n,nonce:0,value:0n}
const signed=await acct.signTransaction(tx)
const ws=new WebSocket("wss://api.hideki2.infra.testnet.somnia.network/ws")
ws.on("open",()=>ws.send(JSON.stringify({jsonrpc:"2.0",id:1,method:"eth_sendRawTransaction",params:[signed]})))
ws.on("message",d=>{console.log("eth_sendRawTransaction ->",String(d));process.exit(0)})
setTimeout(()=>process.exit(1),15000)
