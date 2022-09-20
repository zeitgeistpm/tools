import SDK from "@zeitgeistpm/sdk";

/**
 * Fetches data from Zeitgeist and IPFS for a market with a given identifier.
 * @param marketId The unique identifier for the market you want to fetch.
 */
async function main() {
  // Initialise the provider to connect to the local node
  // wss://bsr.zeitgeist.pm
  // wss://bp-rpc.zeitgeist.pm
  const ZTGNET = "wss://bsr.zeitgeist.pm";

  const sdk = await SDK.initialize(ZTGNET);
  const marketId: number = 1;

  const res = await sdk.models.fetchMarketData(marketId);
  console.log(res.toJSONString());
}

main()
  .catch(console.error)
  .finally(() => process.exit());
