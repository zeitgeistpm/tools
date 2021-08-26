import SDK, { util } from "@zeitgeistpm/sdk";

type Options = {
  poolId: string;
  assetIn: string;
  assetOut: string;
  blocks: string;
  endpoint: string;
  displayWeights?: boolean;
};

const viewSpotPrices = async (opts: Options): Promise<void> => {
  const { poolId, assetIn, assetOut, blocks, endpoint, displayWeights } = opts;

  const blocksAsNumArray = JSON.parse(blocks).map(Number);

  const sdk = await SDK.initialize(endpoint);

  const pool = await sdk.models.fetchPoolData(Number(poolId));

  if (displayWeights) {
    console.log(pool.weights);
  }

  const prices = await pool.fetchPoolSpotPrices(
    assetIn,
    assetOut,
    blocksAsNumArray
  );

  console.log(prices.map((price) => price.toString()).map(Number));
};

export default viewSpotPrices;
