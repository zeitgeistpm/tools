import SDK, { util } from "@zeitgeistpm/sdk";

type Options = {
  endpoint: string;
  title: string;
  description: string;
  oracle: string;
  period: string;
  bounds?: number[];
  isAdvised: boolean;
  seed: string;
  isTimestamp: boolean;
  isCPMM: boolean;
};

const createScalarMarket = async (opts: Options): Promise<void> => {
  const {
    title,
    description,
    oracle,
    period,
    bounds,
    isAdvised,
    endpoint,
    seed,
    isTimestamp,
    isCPMM,
  } = opts;

  const sdk = await SDK.initialize(endpoint);

  const signer = util.signerFromSeed(seed);
  console.log("Sending transaction from", signer.address);

  if (bounds && bounds.length !== 2) {
    throw new Error(
      "If specifying bounds, both lower and higher must be specified."
    );
  }

  const marketPeriod = isTimestamp
    ? { timestamp: period.split(" ").map((x) => +x) }
    : { block: period.split(" ").map((x) => +x) };

  const mdm = { SimpleDisputes: null };

  const marketId = await sdk.models.createScalarMarket(
    signer,
    title,
    description,
    oracle,
    marketPeriod,
    isAdvised ? "Advised" : "Permissionless",
    bounds ? bounds : [0, 100],
    mdm,
    isCPMM ? "CPMM" : "RikiddoSigmoidFeeMarketEma"
  );

  console.log(`Market created! Market Id: ${marketId}`);

  process.exit(0);
};

export default createScalarMarket;
