import SDK, { util } from "@zeitgeistpm/sdk";

async function main() {
  // Initialise the provider to connect to the local node
  // wss://bsr.zeitgeist.pm
  // wss://bp-rpc.zeitgeist.pm
  const ZTGNET = "wss://bsr.zeitgeist.pm";
  const sdk = await SDK.initialize(ZTGNET);
  const block = 10000;

  const blockHash = block ? await sdk.api.rpc.chain.getBlockHash(block) : null;

  const marketId = 1;
  const market = await sdk.models.fetchMarketData(Number(marketId));

  console.log(market.assetSpotPricesInZtg(blockHash));
}

main()
  .catch(console.error)
  .finally(() => process.exit());
