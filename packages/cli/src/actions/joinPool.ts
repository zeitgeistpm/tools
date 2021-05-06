import SDK, { util } from "@zeitgeistpm/sdk";
import { poolJoinBounds } from "../../../sdk/src/types";

type Options = {
  endpoint: string;
  amountIn: string;
  amountOut: string;
  poolId: number;
  seed: string;
};

type SdkJoinPoolFunctionToUse = "joinPool" | "joinPoolMultifunc";
//@ts-ignore
const sdkJoinPoolFunctionToUse: any = "joinPoolMultifunc";

const joinPool = async (opts: Options): Promise<void> => {
  const { endpoint, seed, poolId, amountIn, amountOut, ...bounds } = opts;
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
    sdkJoinPoolFunctionToUse === "joinPool"
      ? await pool.joinPool(signer, amountOut, amountIn.split(","))
      : await pool.joinPoolMultifunc(signer, {
          bounds: trimmedBounds as any,
        });
  console.log(res);
};

export default joinPool;
