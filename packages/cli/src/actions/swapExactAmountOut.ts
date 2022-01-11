import SDK, { util } from "@zeitgeistpm/sdk";

type Options = {
  endpoint: string;
  assetIn: string;
  maxAmountIn: string;
  assetOut: string;
  assetAmountOut: string;
  maxPrice: string;
  poolId: number;
  seed: string;
};

const swapExactAmountOut = async (opts: Options): Promise<void> => {
  const {
    endpoint,
    assetIn,
    maxAmountIn,
    assetOut,
    assetAmountOut,
    maxPrice,
    poolId,
    seed,
  } = opts;

  const sdk = await SDK.initialize(endpoint);

  const signer = util.signerFromSeed(seed);
  console.log("Sending transaction from", signer.address);

  const pool = await sdk.models.fetchPoolData(poolId);
  const res = await pool.swapExactAmountOut(
    signer,
    assetIn,
    maxAmountIn,
    assetOut,
    assetAmountOut,
    maxPrice,
    false
  );
  console.log(res);
};

export default swapExactAmountOut;
