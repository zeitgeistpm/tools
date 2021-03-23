import SDK, { util } from "@zeitgeistpm/sdk";

type Options = {
  endpoint: string;
  marketId: string;
  outcome: string;
  seed: string;
};

const reportMarket = async (opts: Options): Promise<void> => {
  const { endpoint, marketId, outcome, seed } = opts;

  const sdk = await SDK.initialize(endpoint);

  const signer = util.signerFromSeed(seed);

  const market = await sdk.models.fetchMarketData(Number(marketId));
  const res = await market.reportOutcome(signer, Number(outcome));

  console.log(res);
  return;
};

export default reportMarket;
