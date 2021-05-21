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
  console.log("Sending transaction from", signer.address);

  const pool = await sdk.models.fetchPoolData(poolId);
  const res = await pool.swapExactAmountIn(
    signer,
    util.AssetTypeFromString(assetIn),
    Number(assetAmountIn),
    util.AssetTypeFromString(assetOut),
    Number(minAmountOut),
    Number(maxPrice)
  );
  console.log(res);
};

export default swapExactAmountIn;
