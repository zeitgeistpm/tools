import SDK, { util } from "@zeitgeistpm/sdk";

type Options = {
  endpoint: string;
  marketId: number;
  seed: string;
};

const deployPool = async (opts: Options): Promise<void> => {
  const { endpoint, marketId, seed } = opts;

  const sdk = await SDK.initialize(endpoint);

  const signer = util.signerFromSeed(seed);
  console.log("Sending transaction from", signer.address);

  const market = await sdk.models.fetchMarketData(marketId);

  console.log(market);
  const weights = Array(market.outcomeAssets.length+1)
    .fill("1".concat("0".repeat(10)));

  const res = await market.deploySwapPool(signer, weights);

  console.log(res);
};

export default deployPool;
