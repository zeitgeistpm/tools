import SDK, { util } from "@zeitgeistpm/sdk";

type Options = {
  assetIn: string;
  assetAmount: string;
  endpoint: string;
  minPoolAmount: string;
  poolId: number;
  seed: string;
};

const poolJoinWithExactAssetAmount = async (opts: Options): Promise<void> => {
  const { endpoint, seed, poolId, assetIn, assetAmount, minPoolAmount } = opts;

  const sdk = await SDK.initialize(endpoint);

  const signer = util.signerFromSeed(seed);
  console.log("Sending transaction from", signer.address);

  const pool = await sdk.models.fetchPoolData(poolId);

  const res = await pool.poolJoinWithExactAssetAmount(
    signer,
    JSON.parse(assetIn),
    assetAmount,
    minPoolAmount
  );
};

export default poolJoinWithExactAssetAmount;
