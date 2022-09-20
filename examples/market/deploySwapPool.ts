import SDK, { util } from "@zeitgeistpm/sdk";

async function main() {
  // Initialise the provider to connect to the local node
  // wss://bsr.zeitgeist.pm
  // wss://bp-rpc.zeitgeist.pm
  const ZTGNET = "wss://bsr.zeitgeist.pm";
  const sdk = await SDK.initialize(ZTGNET);
  const marketId = 1;
  const weights = "1,1";

  const market = await sdk.models.fetchMarketData(Number(marketId));
  const { outcomeAssets } = market;

  // Generate signer based on seed
  const seed = "";
  const signer = util.signerFromSeed(seed);
  console.log("Sending transaction from", signer.address);

  let wts = [];
  if (weights) {
    wts = weights.split(",");
    if (wts.length !== outcomeAssets.length + 1) {
      throw new Error(
        `Provided weights length must match assets length!\nWeights: ${
          wts.length
        }\nAssets: ${outcomeAssets.length + 1}`
      );
    }
  } else {
    //default
    // do not exceed: pub const MaxWeight: Balance = 50 * BASE;
    // (See: /zeitgeist/runtime/src/lib.rs )
    wts = Array(outcomeAssets.length + 1).fill("1".concat("0".repeat(10)));
  }

  const res = await market.deploySwapPool(signer, wts, false);
  const poolId = await market.getPoolId();

  console.log(res);
  if (poolId !== null) {
    console.log(
      `Canonical pool for market ${marketId} deployed - pool ID: ${poolId}`
    );
  }
}

main()
  .catch(console.error)
  .finally(() => process.exit());
