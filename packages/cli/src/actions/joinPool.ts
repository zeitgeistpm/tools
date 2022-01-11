import SDK, { util } from "@zeitgeistpm/sdk";

type Options = {
  endpoint: string;
  amountIn: string;
  amountOut: string;
  poolId: number;
  seed: string;
};

// "joinPool" | "joinPoolMultifunc | ""
const sdkJoinPoolFunctionToUse = "joinPoolMultifunc";

const joinPool = async (opts: Options): Promise<void> => {
  const { endpoint, seed, poolId, amountIn, amountOut } = opts;
  const trimmedBounds = {
    poolAmount: Number(amountOut),
    assetMax: amountIn.split(",").map(Number),
  };

  const sdk = await SDK.initialize(endpoint);

  const signer = util.signerFromSeed(seed);
  console.log("Sending transaction from", signer.address);

  const pool = await sdk.models.fetchPoolData(poolId);

  /* @ts-ignore */
  const res =
    (sdkJoinPoolFunctionToUse as any) === "joinPool"
      ? await pool.joinPool(signer, amountOut, amountIn.split(","), false)
      : await pool.joinPoolMultifunc(
          signer,
          {
            bounds: trimmedBounds as any,
          },
          false
        );
  console.log(res);
};

export default joinPool;
