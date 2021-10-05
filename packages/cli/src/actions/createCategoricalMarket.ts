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
  isAdvised: boolean;
  seed: string;
  isTimestamp: boolean;
  isCPMM: boolean;
};

const createCategoricalMarket = async (opts: Options): Promise<void> => {
  const {
    slug,
    description,
    oracle,
    period,
    categories,
    isAdvised,
    endpoint,
    seed,
    question,
    isTimestamp,
    isCPMM,
  } = opts;

  const sdk = await SDK.initialize(endpoint);

  const signer = util.signerFromSeed(seed);
  console.log("Sending transaction from", signer.address);

  if (categories && !(categories.length > 1)) {
    if (categories.length === 1) {
      console.log("Valid: -c Yes No Maybe");
      console.log("Valid: --categories Yes No Maybe");
      console.log("Invalid: -categories Yes No Maybe");
      console.log("(no space) Invalid: --cYes No Maybe");
      console.log("(too few categories) Invalid: --c Inevitably");
      console.log();
      if (categories[0] === "ategories") {
        console.log(
          "Did you use the right number of dashes (-c or --categories) ?"
        );
        console.log();
      }
    }
    throw new Error(
      "If specifying categories, at least two must be specified."
    );
  }

  const categoriesMeta: CategoryMetadata[] =
    categories != null
      ? categories.map((cat) => {
          return { name: cat, ticker: cat.slice(0, 5) };
        })
      : [
          { name: "Yes", ticker: "YES" },
          { name: "No", ticker: "NO" },
        ];

  const metadata: DecodedMarketMetadata = {
    description,
    slug,
    question,
    categories: categoriesMeta,
  };

  const marketPeriod = isTimestamp
    ? { timestamp: period.split(" ").map((x) => +x) }
    : { block: period.split(" ").map((x) => +x) };

  const mdm = { SimpleDisputes: null };

  const marketId = await sdk.models.createCategoricalMarket(
    signer,
    oracle,
    marketPeriod,
    isAdvised ? "Advised" : "Permissionless",
    mdm,
    isCPMM ? "CPMM" : "RikiddoSigmoidFeeMarketEma",
    metadata
  );

  console.log(`Market created! Market Id: ${marketId}`);

  process.exit(0);
};

export default createCategoricalMarket;