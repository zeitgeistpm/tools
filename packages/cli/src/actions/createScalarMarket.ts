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
  authorized: string;
  court: boolean;
  cpmm: boolean;
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
    authorized,
    court,
    cpmm,
  } = opts;

  const sdk = await SDK.initialize(endpoint);

  const signer = util.signerFromSeed(seed);
  console.log("Sending transaction from", signer.address);

  if (bounds && bounds.length !== 2) {
    throw new Error(
      "If specifying bounds, both lower and higher must be specified."
    );
  }

  const marketPeriod = timestamp
    ? { timestamp: period.split(" ").map((x) => +x) }
    : { block: period.split(" ").map((x) => +x) };

  let mdm = null;
  if (authorized) {
    mdm = { Authorized: authorized };
  } else {
    mdm = court ? { Court: null } : { SimpleDisputes: null };
  }

  const marketId = await sdk.models.createScalarMarket(
    signer,
    title,
    description,
    oracle,
    marketPeriod,
    advised ? "Advised" : "Permissionless",
    bounds ? bounds : [0, 100],
    mdm,
    cpmm ? "CPMM" : "RikiddoSigmoidFeeMarketEma",
    false
  );

  if (marketId && marketId.length > 0) {
    console.log(`Scalar market created! Market Id: ${marketId}`);
  } else {
    console.log(`Scalar market creation failed!`);
  }

  process.exit(0);
};

export default createScalarMarket;
