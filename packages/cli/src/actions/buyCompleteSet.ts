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

  console.log(endpoint, marketId, amount, seed);
  
  const sdk = await SDK.initialize(endpoint);
  
  const signer = util.signerFromSeed(seed);

  const market = await sdk.models.fetchMarketData(Number(marketId));
  const res = await market.buyCompleteSet(signer, Number(amount));

  console.log('res:', res);
  return;
};

export default buyCompleteSet;
