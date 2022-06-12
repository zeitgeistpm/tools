import SDK, { util } from "@zeitgeistpm/sdk";

type Options = {
  endpoint: string;
  assetIn: string;
  assetAmountIn: string;
  assetOut: string;
  minAmountOut: string;
  maxPrice: string;
  poolId: number;
  seed: string;
};

const swapExactAmountIn = async (opts: Options): Promise<void> => {
  const {
    endpoint,
    assetIn,
    assetAmountIn,
    assetOut,
    minAmountOut,
    maxPrice,
    poolId,
    seed,
  } = opts;

  const sdk = await SDK.initialize(endpoint);

  const signer = util.signerFromSeed(seed);
  console.log(
    `\x1b[33m%s\x1b[0m`,
    `Sending transaction from ${signer.address}\n`
  );

  const pool = await sdk.models.fetchPoolData(poolId);
  const res = await pool.swapExactAmountIn({
    signer,
    assetIn,
    assetAmountIn,
    assetOut,
    minAmountOut,
    maxPrice,
    callbackOrPaymentInfo: false,
  });

  if (res) {
    console.log(`\x1b[36m%s\x1b[0m`, `\nSwapExactAmountIn successful!`);
  } else {
    console.log(`\x1b[36m%s\x1b[0m`, `\nSwapExactAmountIn failed!`);
  }
};

export default swapExactAmountIn;
