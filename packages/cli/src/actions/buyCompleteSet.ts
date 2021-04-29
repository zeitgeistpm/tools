// import SDK, { util } from "@zeitgeistpm/sdk";
import SDK, { util } from "../../../sdk/src";

type Options = {
  endpoint: string;
  marketId: string;
  amount: string;
  seed: string;
};

const buyCompleteSet = async (opts: Options): Promise<void> => {
  const { endpoint, marketId, amount, seed } = opts;

  const sdk = await SDK.initialize(endpoint);
  
  const signer = util.signerFromSeed(seed);
  console.log(`Buy complete set of ${amount} market ${marketId} outcomes for ${signer.address} on network ${endpoint}`);  

  const market = await sdk.models.fetchMarketData(Number(marketId));
  const res = await market.buyCompleteSet(signer, Number(amount));

  if (res === true) {
    console.log(`${signer.address} bought complete set of ${amount} market ${marketId} outcomes on network ${endpoint}`);  
  }
  return;
};

export default buyCompleteSet;
