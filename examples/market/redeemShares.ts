import SDK, { util } from "@zeitgeistpm/sdk";

async function main() {
  // Initialise the provider to connect to the local node
  // wss://bsr.zeitgeist.pm
  // wss://bp-rpc.zeitgeist.pm
  const ZTGNET = "wss://bsr.zeitgeist.pm";
  const sdk = await SDK.initialize(ZTGNET);
  const marketId = 8;
  const outcome = "1";

  // Generate signer based on seed
  const seed = "";
  const signer = util.signerFromSeed(seed);
  console.log("Sending transaction from", signer.address);

  const market = await sdk.models.fetchMarketData(Number(marketId));

  const outcomeReport = market.marketType.isCategorical
    ? { categorical: Number(outcome) }
    : { scalar: Number(outcome) };
  const res = await market.redeemShares(signer, false);

  console.log(res);
}

main()
  .catch(console.error)
  .finally(() => process.exit());
