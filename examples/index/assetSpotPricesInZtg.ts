import SDK from "@zeitgeistpm/sdk";

/**
 * Can be used to find prices at a particular block using unique identifier.
 * @param blockHash The unique identifier for the block to fetch asset spot prices.
 * @returns Spot prices of all assets in all markets at Zeitgeist.
 */
async function main() {
  // Initialise the provider to connect to the local node
  // wss://bsr.zeitgeist.pm
  // wss://bp-rpc.zeitgeist.pm
  const ZTGNET = "wss://bsr.zeitgeist.pm";
  const sdk = await SDK.initialize(ZTGNET);
  const block = 1248154;

  const blockHash = block ? await sdk.api.rpc.chain.getBlockHash(block) : null;

  const res = await sdk.models.assetSpotPricesInZtg(blockHash);

  if (block) {
    console.log("Block:", block);
  }
  console.log(res);
}

main()
  .catch(console.error)
  .finally(() => process.exit());
