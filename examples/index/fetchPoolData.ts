import SDK, { util } from "@zeitgeistpm/sdk";

/**
 * @param poolId The unique identifier for the pool you want to fetch data.
 * @returns `Swap` for the given `poolId`.
 */
async function main() {
  // Initialise the provider to connect to the local node
  // wss://bsr.zeitgeist.pm
  // wss://bp-rpc.zeitgeist.pm
  const ZTGNET = "wss://bsr.zeitgeist.pm";
  const sdk = await SDK.initialize(ZTGNET);
  const marketId = 1;

  const market = await sdk.models.fetchMarketData(Number(marketId));
  const swapId = await market.getPoolId();

  if (swapId != 0 && !swapId) {
    throw new Error("Swap for this market does not exist.");
  }
  console.log(swapId);

  const swap = await sdk.models.fetchPoolData(swapId);
  if (swap != null) {
    console.log(swap.toJSONString());
  }
}

main()
  .catch(console.error)
  .finally(() => process.exit());
