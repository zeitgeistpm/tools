import SDK, { util } from "@zeitgeistpm/sdk";
import {
  DecodedMarketMetadata,
  MarketDeadlines,
} from "@zeitgeistpm/sdk/dist/types";

type Options = {
  endpoint: string;
  oracle: string;
  period: string;
  gracePeriod: string;
  oracleDuration: string;
  disputeDuration: string;
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
    gracePeriod,
    oracleDuration,
    disputeDuration,
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
  console.log(
    `\x1b[33m%s\x1b[0m`,
    `Sending transaction from ${signer.address}\n`
  );

  if (bounds && bounds.length !== 2) {
    throw new Error(
      `If specifying bounds, both lower and higher must be specified.`
    );
  }

  const marketPeriod = timestamp
    ? { timestamp: period.split(` `).map((x) => +x) }
    : { block: period.split(` `).map((x) => +x) };

  const deadlines: MarketDeadlines = {
    gracePeriod: gracePeriod,
    oracleDuration: oracleDuration,
    disputeDuration: disputeDuration,
  };

  let disputeMechanism = null;
  if (authorized) {
    disputeMechanism = { Authorized: authorized };
  } else {
    disputeMechanism = court ? { Court: null } : { SimpleDisputes: null };
  }

  const marketId = await sdk.models.createMarket({
    signer,
    oracle,
    period: marketPeriod,
    deadlines,
    metadata,
    creationType: advised ? `Advised` : `Permissionless`,
    marketType: { Scalar: bounds ? bounds : [0, 100] },
    disputeMechanism,
    scoringRule: cpmm ? `CPMM` : `RikiddoSigmoidFeeMarketEma`,
    callbackOrPaymentInfo: false,
  });

  if (marketId && marketId.length > 0) {
    console.log(`\x1b[36m%s\x1b[0m`, `\ncreateScalarMarket successful!`);
  } else {
    console.log(`\x1b[36m%s\x1b[0m`, `\ncreateScalarMarket failed!`);
  }
};

export default createScalarMarket;
