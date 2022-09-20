import SDK from "@zeitgeistpm/sdk";

/**
 * Gets all markets that exist in storage.
 * Warning: this could take a while to finish.
 * @returns The market data using their corresponding `marketId`.
 */
async function main() {
  // Initialise the provider to connect to the local node
  // wss://bsr.zeitgeist.pm
  // wss://bp-rpc.zeitgeist.pm
  const ZTGNET = "wss://bsr.zeitgeist.pm";

  const sdk = await SDK.initialize(ZTGNET, { logEndpointInitTime: false });

  const res = await sdk.models.getAllMarkets();

  res.forEach((market) => console.log(market.toJSONString()));
}

main()
  .catch(console.error)
  .finally(() => process.exit());
