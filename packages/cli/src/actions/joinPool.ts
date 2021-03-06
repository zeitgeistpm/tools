import SDK, { util } from "@zeitgeistpm/sdk";

type Options = {
  endpoint: string;
  amountIn: string;
  amountOut: string;
  poolId: number,
  seed: string;
};

const joinPool = async (opts: Options): Promise<void> => {
  const { endpoint, amountIn, amountOut , poolId, seed } = opts;

  const sdk = await SDK.initialize(endpoint);

  const signer = util.signerFromSeed(seed);
  console.log("Sending transaction from", signer.address);

  const pool = await sdk.models.fetchPoolData(poolId);
  const res = await pool.joinPool(signer,amountOut, amountIn.split(','));
  console.log(res);
};

export default joinPool;
