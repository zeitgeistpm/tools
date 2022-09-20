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
  const blocks = "1,2";

  const blocksAsNumArray = JSON.parse(blocks).map(Number);

  const AssetIn = sdk.api.createType("Asset", util.AssetIdFromString(assetIn));
  const AssetOut = sdk.api.createType(
    "Asset",
    util.AssetIdFromString(assetOut)
  );

  const pool = await sdk.models.fetchPoolData(Number(poolId));
  const prices = await pool.fetchPoolSpotPrices(
    assetIn,
    assetOut,
    blocksAsNumArray
  );

  console.log(prices.map((price) => price.toString()).map(Number));
}

main()
  .catch(console.error)
  .finally(() => process.exit());
