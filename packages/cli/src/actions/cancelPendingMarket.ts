import SDK, { util } from "@zeitgeistpm/sdk";

type Options = {
  endpoint: string;
  marketId: string;
  outcome: string;
  seed: string;
};

const cancelPendingMarket = async (opts: Options): Promise<void> => {
  const { endpoint, marketId, seed } = opts;

  const sdk = await SDK.initialize(endpoint);

  const signer = util.signerFromSeed(seed);

  const market = await sdk.model.fetchMarketData(Number(marketId));
  const res = await market.cancelAdvised(signer);

  console.log(res);
  return;
};

export default cancelPendingMarket;
