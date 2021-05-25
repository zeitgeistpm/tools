import SDK from "@zeitgeistpm/sdk";

type Options = {
  endpoint: string;
  amountIn: string;
  amountOut: string;
  poolId: number;
  seed: string;
};

const countMarkets = async (opts: Options): Promise<void> => {
  const { endpoint } = opts;

  const sdk = await SDK.initialize(endpoint);

  const res = await sdk.model.getMarketCount();

  console.log(res);
};

export default countMarkets;
