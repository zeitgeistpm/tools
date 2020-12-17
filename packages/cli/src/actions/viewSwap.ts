import SDK from "@zeitgeistpm/sdk";

type Options = {
  endpoint: string;
  marketId: string;
};

const viewSwap = async (opts: Options): Promise<void> => {
  const { endpoint, marketId } = opts;

  const sdk = await SDK.initialize(endpoint);

  const market = await sdk.models.fetchMarketData(Number(marketId));
  const swapId = await market.getPoolId();

  if (swapId != 0 && !swapId) {
    throw new Error("Swap for this market does not exist.");
  }

  const swap = await sdk.models.fetchPoolData(swapId);
  console.log(swap.toJSONString());
};

export default viewSwap;
