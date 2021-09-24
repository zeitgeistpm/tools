import SDK, { util } from "@zeitgeistpm/sdk";

type Options = {
  endpoint: string;
  title: string;
  description: string;
  oracle: string;
  period: string;
  bounds?: number[];
  advised: boolean;
  seed: string;
  timestamp: boolean;
};

const createScalarMarket = async (opts: Options): Promise<void> => {
  const {
    title,
    description,
    oracle,
    period,
    bounds,
    advised,
    endpoint,
    seed,
    timestamp,
  } = opts;

  const sdk = await SDK.initialize(endpoint);

  const signer = util.signerFromSeed(seed);
  console.log("Sending transaction from", signer.address);

  if (bounds.length !== 2) {
    throw new Error(
      "If specifying bounds, both lower and higher must be specified."
    );
  }

  const marketPeriod = timestamp
    ? { timestamp: Number(period) }
    : { block: Number(period) };

  const marketId = await sdk.models.createScalarMarket(
    signer,
    title,
    description,
    oracle,
    marketPeriod,
    advised ? "Advised" : "Permissionless",
    bounds ? bounds : [0, 100]
  );

  console.log(`Market created! Market Id: ${marketId}`);

  process.exit(0);
};

export default createScalarMarket;
