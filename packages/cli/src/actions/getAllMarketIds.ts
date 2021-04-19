import SDK, { util } from "@zeitgeistpm/sdk";

type Options = {
  endpoint: string;
  amountIn: string;
  amountOut: string;
  poolId: number;
  seed: string;
};

const getAllMarketIds = async (opts: Options): Promise<void> => {
  const { endpoint } = opts;

  const sdk = await SDK.initialize(endpoint);

  const res = await sdk.models.getAllMarketIds();

  console.log(res);
};

export default getAllMarketIds;
