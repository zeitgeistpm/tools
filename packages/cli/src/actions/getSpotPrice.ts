// import SDK, { util } from "@zeitgeistpm/sdk";
import SDK, { util } from "../../..//sdk/src";

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

  const AssetIn = sdk.api.createType("Asset", util.AssetIdFromString(assetIn));
  const AssetOut = sdk.api.createType(
    "Asset",
    util.AssetIdFromString(assetOut)
  );

  const pool = await sdk.models.fetchPoolData(Number(poolId));
  const price = await pool.getSpotPrice(AssetIn, AssetOut, blockHash);

  console.log(`${price}`);
};

export default getSpotPrice;
