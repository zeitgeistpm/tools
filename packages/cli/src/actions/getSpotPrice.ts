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

  const accountId = await pool.accountId();
  const price = await pool.getSpotPrice(
    util.assetTypeFromString(assetIn, sdk.api),
    util.assetTypeFromString(assetOut, sdk.api),
    blockHash
  );

  console.log(`${price}`);
  console.log(`accountId ${accountId}`);
};

export default getSpotPrice;
