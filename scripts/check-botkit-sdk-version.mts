// Run from dreamdex-bot-kit/packages/perp-core after `npm install` at the repo root.
import * as sdk from "@somnia-chain/markets-sdk"
import { hidekiTestnet } from "@somnia-chain/markets-sdk/chains"
console.log("SOMNIA_HIDEKI_TESTNET_ADDRESSES:", typeof (sdk as any).SOMNIA_HIDEKI_TESTNET_ADDRESSES)
// throwaway dummy key, never funded
const m = new (sdk as any).SomniaMarkets({ chain: hidekiTestnet, indexerUrl: "https://hideki-dev.smk.somnia.host/v1/graphql", privateKey: "0x" + "11".repeat(32) })
console.log("trader.claimPerpVoucher:", typeof m.trader?.claimPerpVoucher, "| client.getPerpVoucherEligibility:", typeof m.client.getPerpVoucherEligibility, "| client.getMaxPerpOrderSize:", typeof m.client.getMaxPerpOrderSize)
process.exit(0)
