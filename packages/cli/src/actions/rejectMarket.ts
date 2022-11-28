import SDK, { util } from "@zeitgeistpm/sdk";

type Options = {
  endpoint: string;
  marketId: string;
  outcome: string;
  seed: string;
  reason: string;
};

const rejectMarket = async (opts: Options): Promise<void> => {
  const { endpoint, marketId, reason, seed } = opts;

  const sdk = await SDK.initialize(endpoint);

  const signer = util.signerFromSeed(seed);

  const market = await sdk.models.fetchMarketData(Number(marketId));
  const res = await market.reject(signer, reason, false);

  if (res && res.length > 0) {
    console.log(`\x1b[36m%s\x1b[0m`, `\nRejectMarket successful!`);
  } else {
    console.log(`\x1b[36m%s\x1b[0m`, `\nRejectMarket failed!`);
  }
  return;
};

export default rejectMarket;
