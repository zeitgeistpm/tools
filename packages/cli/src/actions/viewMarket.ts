// import SDK, { util } from "@zeitgeistpm/sdk";
import SDK, { util } from "../../../sdk/src";

type Options = {
  endpoint: string;
  marketId: string;
  seed?: string;
  address?: string;
};

const viewMarket = async (opts: Options): Promise<void> => {
  const { endpoint, marketId, seed } = opts;
  let { address } = opts;

  const sdk = await SDK.initialize(endpoint);
  
  if (seed) {
    address = address || util.signerFromSeed(seed).address
  }

  const market = address
    ? await sdk.models.fetchMarketData(Number(marketId), { address })
    : await sdk.models.fetchMarketData(Number(marketId));

  console.log(market.toJSONString());
};

export default viewMarket;
