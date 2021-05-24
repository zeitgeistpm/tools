import SDK, { util } from "@zeitgeistpm/sdk";

type Options = {
  assetIn: string;
  assetAmount: string;
  endpoint: string;
  minPoolAmount: string;
  poolId: number;
  seed: string;
};

const poolExitWithExactPoolAmount = async (opts: Options): Promise<void> => {
  const { endpoint, seed, poolId, assetIn, assetAmount, minPoolAmount } = opts;

  const sdk = await SDK.initialize(endpoint);

  const signer = util.signerFromSeed(seed);
  console.log("Sending transaction from", signer.address);

  const pool = await sdk.models.fetchPoolData(poolId);

  const res = await pool.poolExitWithExactPoolAmount(
    signer,
    JSON.parse(assetIn),
    Number(assetAmount),
    Number(minPoolAmount)
  );
};

export default poolExitWithExactPoolAmount;
