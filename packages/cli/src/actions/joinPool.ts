// import SDK, { util } from "@zeitgeistpm/sdk";
import SDK, { util } from "../../../sdk/src";
import { poolJoinBounds } from "../../../sdk/src/types";

type Options = {
  endpoint: string;
  amountIn: string;
  amountOut: string;
  poolId: number;
  seed: string;
};

const joinPool = async (opts: Options): Promise<void> => {
  const { endpoint, amountIn, amountOut, poolId, seed } = opts;

  const sdk = await SDK.initialize(endpoint);

  const signer = util.signerFromSeed(seed);
  console.log("Sending transaction from", signer.address);

  const pool = await sdk.models.fetchPoolData(poolId);
  const res = await pool.joinPool(signer, amountOut, amountIn.split(","));
  console.log(res);
};

const joinPoolMulti = async (opts: Options): Promise<void> => {
  const { endpoint, seed, poolId, amountIn, amountOut, ...bounds } = opts;
  const trimmedBounds = {
    poolAmount: Number(amountOut),
    assetMax: amountIn.split(",").map(Number)
  };

  const sdk = await SDK.initialize(endpoint);

  const signer = util.signerFromSeed(seed);
  console.log("Sending transaction from", signer.address);

  const pool = await sdk.models.fetchPoolData(poolId);
  const res = await pool.joinPoolMultifunc(
    signer, 
    { 
      bounds: trimmedBounds
    } 
  );
  console.log(res);
};

export default joinPoolMulti;
