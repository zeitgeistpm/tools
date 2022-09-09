import SDK, { util } from "@zeitgeistpm/sdk";
import {
  CategoryMetadata,
  DecodedMarketMetadata,
} from "@zeitgeistpm/sdk/dist/types";

type Options = {
  endpoint: string;
  slug: string;
  description: string;
  oracle: string;
  period: string;
  categories?: string[];
  question: string;
  seed: string;
  timestamp: boolean;
  authorized: string;
  court: boolean;
  swapFee: string;
  amount: string;
  weights: string;
  estimateFee: boolean;
};

const createMarketAndDeployPool = async (opts: Options): Promise<void> => {
  const {
    slug,
    description,
    oracle,
    period,
    categories,
    endpoint,
    seed,
    question,
    timestamp,
    authorized,
    court,
    swapFee,
    amount,
    weights,
    estimateFee,
  } = opts;

  const sdk = await SDK.initialize(endpoint);

  const signer = util.signerFromSeed(seed);

  if (!estimateFee) {
    console.log(
      `\x1b[33m%s\x1b[0m`,
      `Sending transaction from ${signer.address}\n`
    );
  }

  if (categories && !(categories.length > 1)) {
    if (categories.length === 1) {
      console.log(`Valid: -c Yes No Maybe`);
      console.log(`Valid: --categories Yes No Maybe`);
      console.log(`Invalid: -categories Yes No Maybe`);
      console.log(`(no space) Invalid: --cYes No Maybe`);
      console.log(`(too few categories) Invalid: --c Inevitably`);
      console.log();
      if (categories[0] === `ategories`) {
        console.log(
          `Did you use the right number of dashes (-c or --categories) ?`
        );
        console.log();
      }
    }
    throw new Error(
      `If specifying categories, at least two must be specified.`
    );
  }

  const categoriesMeta: CategoryMetadata[] =
    categories != null
      ? categories.map((cat) => {
          return { name: cat, ticker: cat.slice(0, 5) };
        })
      : [
          { name: `Yes`, ticker: `YES` },
          { name: `No`, ticker: `NO` },
        ];

  const metadata: DecodedMarketMetadata = {
    description,
    slug,
    question,
    categories: categoriesMeta,
  };

  const marketPeriod = timestamp
    ? { timestamp: period.split(` `).map((x) => +x) }
    : { block: period.split(` `).map((x) => +x) };

  const marketType = { Categorical: metadata.categories.length };

  let disputeMechanism = null;
  if (authorized) {
    disputeMechanism = { Authorized: authorized };
  } else {
    disputeMechanism = court ? { Court: null } : { SimpleDisputes: null };
  }

  const res = await sdk.models.createCpmmMarketAndDeployAssets({
    signer,
    oracle,
    period: marketPeriod,
    marketType,
    disputeMechanism,
    swapFee,
    amount,
    weights: weights.split(`,`),
    metadata,
    callbackOrPaymentInfo: estimateFee,
  });

  if (estimateFee) {
    console.log("Fee estimation for transaction", res);
    return;
  }

  if (res) {
    console.log(`\x1b[36m%s\x1b[0m`, `\nCreateMarketAndDeployPool successful!`);
  } else {
    console.log(`\x1b[36m%s\x1b[0m`, `\nCreateMarketAndDeployPool failed!`);
  }
};

export default createMarketAndDeployPool;
