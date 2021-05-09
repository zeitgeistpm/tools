import SDK, { util } from "@zeitgeistpm/sdk";

type Options = {
  endpoint: string;
  title: string;
  description: string;
  oracle: string;
  end: string;
  categories?: string[];
  advised: boolean;
  seed: string;
  timestamp: boolean;
};

const createMarket = async (opts: Options): Promise<void> => {
  const {
    title,
    description,
    oracle,
    end,
    categories,
    advised,
    endpoint,
    seed,
    timestamp,
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

  const marketEnd = timestamp
    ? { timestamp: Number(end) }
    : { block: Number(end) };

  const marketId = await sdk.models.createNewMarket(
    signer,
    title,
    description,
    oracle,
    marketEnd,
    advised ? "Advised" : "Permissionless",
    categories && categories.length > 1 ? categories : ["Yes", "No"]
  );

  console.log(`Market created! Market Id: ${marketId}`);

  process.exit(0);
};

export default createMarket;
