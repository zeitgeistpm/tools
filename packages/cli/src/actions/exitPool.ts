import SDK, { util } from "@zeitgeistpm/sdk";

type Options = {
  endpoint: string;
  amountIn: string;
  amountOut: string;
  poolId: number;
  seed: string;
};

const exitPool = async (opts: Options): Promise<void> => {
  const { endpoint, seed, poolId, amountIn, amountOut, ...bounds } = opts;
  const trimmedBounds = {
    poolAmount: Number(amountIn),
    assetMin: amountOut.split(",").map(Number),
  };

  const sdk = await SDK.initialize(endpoint);

  const signer = util.signerFromSeed(seed);
  console.log("Sending transaction from", signer.address);

  const pool = await sdk.models.fetchPoolData(poolId);
  const res = await pool.exitPool(
    signer,
    trimmedBounds.poolAmount,
    trimmedBounds.assetMin
  );
  console.log(res);
};

export default exitPool;
