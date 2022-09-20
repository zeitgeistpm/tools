import SDK, { util } from "@zeitgeistpm/sdk";

async function main() {
  // Initialise the provider to connect to the local node
  // wss://bsr.zeitgeist.pm
  // wss://bp-rpc.zeitgeist.pm
  const ZTGNET = "wss://bsr.zeitgeist.pm";
  const sdk = await SDK.initialize(ZTGNET);
  const marketId = 8;

  // Generate signer based on seed
  const seed = "";
  const signer = util.signerFromSeed(seed);
  console.log("Sending transaction from", signer.address);

  const market = await sdk.models.fetchMarketData(Number(marketId));
  console.log(market.sellCompleteSet(signer, Number(1000000000000)));
}

main()
  .catch(console.error)
  .finally(() => process.exit());
