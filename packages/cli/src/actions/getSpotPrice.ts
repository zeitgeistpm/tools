import SDK, { util } from "@zeitgeistpm/sdk";

type Options = {
  assetIn: string;
  assetOut: string;
  endpoint: string;
  poolId: string;
  blockHash?: string;
};

const getSpotPrice = async (opts: Options): Promise<void> => {
  const { endpoint, poolId, assetIn, assetOut, blockHash } = opts;

  const sdk = await SDK.initialize(endpoint);

  const pool = await sdk.models.fetchPoolData(Number(poolId));
  //@ts-ignore
  const price = await pool.getSpotPrice(assetIn, assetOut, blockHash);

  console.log(price.toString());
};

export default getSpotPrice;
