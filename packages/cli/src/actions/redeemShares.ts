import SDK, { util } from "@zeitgeistpm/sdk";

type Options = {
  endpoint: string;
  marketId: string;
  seed: string;
};

const redeemShares = async (opts: Options): Promise<void> => {
  const { endpoint, marketId, seed } = opts;

  const sdk = await SDK.initialize(endpoint);

  const signer = util.signerFromSeed(seed);

  const market = await sdk.models.fetchMarketData(Number(marketId));
  const res = await market.redeemShares(signer);

  console.log(res);
  return;
};

export default redeemShares;
