import SDK, { util } from "@zeitgeistpm/sdk";

async function main() {
  // Initialise the provider to connect to the local node
  // wss://bsr.zeitgeist.pm
  // wss://bp-rpc.zeitgeist.pm
  const ZTGNET = "wss://bsr.zeitgeist.pm";
  const sdk = await SDK.initialize(ZTGNET);
  const assetIn = "";
  const assetOut = "";
  const poolId = 1;
  const blockHash = "";

  const AssetIn = sdk.api.createType("Asset", util.AssetIdFromString(assetIn));
  const AssetOut = sdk.api.createType(
    "Asset",
    util.AssetIdFromString(assetOut)
  );

  const pool = await sdk.models.fetchPoolData(Number(poolId));
  const price = await pool.getSpotPrice(AssetIn, AssetOut, blockHash);
  console.log(`${price}`);
}

main()
  .catch(console.error)
  .finally(() => process.exit());
