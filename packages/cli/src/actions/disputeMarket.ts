import SDK, { util } from "@zeitgeistpm/sdk";

type Options = {
  endpoint: string;
  marketId: string;
  outcome: string;
  seed: string;
};

const disputeMarket = async (opts: Options): Promise<void> => {
  const { endpoint, marketId, outcome, seed } = opts;

  const sdk = await SDK.initialize(endpoint);

  const signer = util.signerFromSeed(seed);

  const market = await sdk.models.fetchMarketData(Number(marketId));
  const outcomeReport = market.marketType.isCategorical
    ? { categorical: Number(outcome) }
    : { scalar: Number(outcome) };
  const res = await market.dispute(signer, outcomeReport, false);

  console.log(res);
  return;
};

export default disputeMarket;
