// import SDK, { util } from "@zeitgeistpm/sdk";
import SDK, { util } from "../../../sdk/src";


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

  const res = await sdk.models.getMarketCount();

  console.log(res);
};

export default countMarkets;
