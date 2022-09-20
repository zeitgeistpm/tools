import SDK from "@zeitgeistpm/sdk";

/**
 * Gets all the market ids that exist in storage.
 * Warning: This could take a while to finish.
 * @returns The `marketId` of all markets.
 */
async function main() {
  // Initialise the provider to connect to the local node
  // wss://bsr.zeitgeist.pm
  // wss://bp-rpc.zeitgeist.pm
  const ZTGNET = "wss://bsr.zeitgeist.pm";

  const sdk = await SDK.initialize(ZTGNET);
  const marketId: number = 1;

  const res = await sdk.models.getAllMarketIds();
  console.log(res);
}

main()
  .catch(console.error)
  .finally(() => process.exit());
