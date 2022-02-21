import SDK, { util } from "@zeitgeistpm/sdk";
import { DecodedMarketMetadata } from "@zeitgeistpm/sdk/dist/types";

type Options = {
  endpoint: string;
  oracle: string;
  period: string;
  bounds?: number[];
  advised: boolean;
  seed: string;
  timestamp: boolean;
  authorized: string;
  court: boolean;
  cpmm: boolean;
  metadata: DecodedMarketMetadata;
};

const createScalarMarket = async (opts: Options): Promise<void> => {
  const {
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
    metadata,
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
    oracle,
    marketPeriod,
    advised ? "Advised" : "Permissionless",
    mdm,
    cpmm ? "CPMM" : "RikiddoSigmoidFeeMarketEma",
    metadata,
    bounds ? bounds : [0, 100],
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
