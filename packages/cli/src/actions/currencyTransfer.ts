import SDK, { util } from "@zeitgeistpm/sdk";

type Options = {
  endpoint: string;
  dest: string;
  marketId?: number;
  categoryIndex?: number;
  scalarPos?: string;
  poolShare?: number;
  ztg?: boolean;
  amount: number;
  seed: string;
};

const currencyTransfer = async (opts: Options): Promise<void> => {
  const {
    dest,
    marketId,
    categoryIndex,
    scalarPos,
    poolShare,
    ztg,
    amount,
    endpoint,
    seed,
  } = opts;

  const sdk = await SDK.initialize(endpoint);

  const signer = util.signerFromSeed(seed);
  console.log("Sending transaction from", signer.address);

  let currencyId;
  if (marketId) {
    if (categoryIndex) {
      currencyId = { CategoricalOutcome: [marketId, categoryIndex] };
    } else if (scalarPos) {
      currencyId = { ScalarOutcome: [marketId, scalarPos] };
    } else {
      throw new Error(
        "If specifying marketId, either categoryIndex or scalarPos must be provided."
      );
    }
  } else if (poolShare) {
    currencyId = { PoolShare: null };
  } else if (ztg) {
    currencyId = { Ztg: null };
  } else {
    currencyId = { CombinatorialOutcome: null };
  }

  const res = await sdk.models.currencyTransfer(
    signer,
    dest,
    currencyId,
    amount
  );

  if (res) {
    console.log(`Successfully transferred ${JSON.stringify(currencyId)}`);
  } else {
    console.log(
      `Unable to transfer ${JSON.stringify(currencyId)} - check balance.`
    );
  }
  process.exit(0);
};

export default currencyTransfer;
