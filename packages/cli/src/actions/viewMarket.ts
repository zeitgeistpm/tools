import SDK from "@zeitgeistpm/sdk";

type Options = {
  endpoint: string;
  marketId: string;
};

const viewMarket = async (opts: Options): Promise<void> => {
  const { endpoint, marketId } = opts;

  const sdk = await SDK.initialize(endpoint);

  const market = await sdk.models.fetchMarketData(Number(marketId));

  console.log(market.toJSONString());
};

export default viewMarket;
