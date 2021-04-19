// import SDK, { util } from "@zeitgeistpm/sdk";
import SDK, { util } from "../../../sdk/src";


type Options = {
  endpoint: string;
  amountIn: string;
  amountOut: string;
  poolId: number;
  seed: string;
};

const getAllMarkets = async (opts: Options): Promise<void> => {
  const { endpoint } = opts;

  const sdk = await SDK.initialize(endpoint);

  const res = await sdk.models.getAllMarkets();

  res.forEach(market=> console.log(market.toJSONString()));
};

export default getAllMarkets;
