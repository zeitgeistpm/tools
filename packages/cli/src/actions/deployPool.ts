import SDK, { util } from "@zeitgeistpm/sdk";

type Options = {
  endpoint: string;
  marketId: number;
  seed: string;
  amount: string;
  weights: string;
};

const deployPool = async (opts: Options): Promise<void> => {
  const { endpoint, marketId, seed, weights, amount } = opts;

  const sdk = await SDK.initialize(endpoint);

  const signer = util.signerFromSeed(seed);
  console.log(
    `\x1b[33m%s\x1b[0m`,
    `Sending transaction from ${signer.address}\n`
  );

  const market = await sdk.models.fetchMarketData(marketId);
  const { outcomeAssets } = market;

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

  const poolId = await market.deploySwapPool(signer, amount, wts, false);
  if (poolId && poolId.length > 0) {
    console.log(`\x1b[36m%s\x1b[0m`, `\nDeployPool successful!`);
  } else {
    console.log(`\x1b[36m%s\x1b[0m`, `\nDeployPool failed!`);
  }
};

export default deployPool;
