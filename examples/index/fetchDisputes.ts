import SDK from "@zeitgeistpm/sdk";

async function main() {
  // Initialise the provider to connect to the local node
  // wss://bsr.zeitgeist.pm
  // wss://bp-rpc.zeitgeist.pm
  const ZTGNET = "wss://bsr.zeitgeist.pm";
  const sdk = await SDK.initialize(ZTGNET);
  const marketId = 1;

  const market = await sdk.models.fetchDisputes(Number(marketId));
  console.log(market);
}

main()
  .catch(console.error)
  .finally(() => process.exit());
