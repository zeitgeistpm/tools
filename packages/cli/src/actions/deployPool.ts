import SDK, { util } from "@zeitgeistpm/sdk";

type Options = {
  endpoint: string;
  marketId: number;
  seed: string;
  weights: string;
};

const deployPool = async (opts: Options): Promise<void> => {
  const { endpoint, marketId, seed, weights } = opts;

  const sdk = await SDK.initialize(endpoint);

  const signer = util.signerFromSeed(seed);
  console.log("Sending transaction from", signer.address);

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

  const res = await market.deploySwapPool(signer, wts);

  console.log(res);

  process.exit(0);
};

export default deployPool;
