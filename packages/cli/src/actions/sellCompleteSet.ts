import SDK, { util } from "@zeitgeistpm/sdk";

type Options = {
  endpoint: string;
  marketId: string;
  amount: string;
  seed: string;
};

const sellCompleteSet = async (opts: Options): Promise<void> => {
  const { endpoint, marketId, amount, seed } = opts;

  const sdk = await SDK.initialize(endpoint);

  const signer = util.signerFromSeed(seed);

  const market = await sdk.models.fetchMarketData(Number(marketId));
  const res = await market.sellCompleteSet(signer, Number(amount));

  console.log(res);
  return;
};

export default sellCompleteSet;
