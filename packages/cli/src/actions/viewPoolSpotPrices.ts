// import SDK, { util } from "@zeitgeistpm/sdk";
import SDK, { util } from "../../../sdk/src";

type Options = {
  assetIn: string;
  assetOut: string;
  endpoint: string;
  poolId: string;
  marketId?: string;
};

const viewSpotPrices = async (opts: Options): Promise<void> => {
  const { endpoint, poolId, marketId, assetIn, assetOut } = opts;
  let poolIdNum;

  const sdk = await SDK.initialize(endpoint);

  if (marketId !== undefined) {
    const market = await sdk.models.fetchMarketData(Number(marketId));
    poolIdNum = await market.getPoolId();
  } else {
    poolIdNum = Number(poolId);
  }

  const pool = await sdk.models.fetchPoolData(poolIdNum);

  console.log(pool.weights);
  console.log("\n\n\n");

  //@ts-ignore
  const prices = await pool.fetchPoolSpotPrices(
    util.AssetIdFromString(assetIn),
    util.AssetIdFromString(assetOut)
  );

  console.log(prices);
};

export default viewSpotPrices;
