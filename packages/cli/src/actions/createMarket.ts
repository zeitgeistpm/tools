// import SDK, { util } from "@zeitgeistpm/sdk";
import SDK, { util } from "../../../sdk/src";

type Options = {
  endpoint: string;
  title: string;
  description: string;
  oracle: string;
  end: string;
  categories?: string[];
  advised: boolean;
  scalar: string[];
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
    scalar,
    endpoint,
    seed,
    timestamp,
  } = opts;

  const sdk = await SDK.initialize(endpoint);

  const marketEnd = timestamp
    ? { timestamp: Number(end) }
    : { block: Number(end) };

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

  if (scalar) {
    if (scalar.length !== 2 || scalar.map(Number).some(isNaN)) {
      if (scalar.length === 0 || !Array.isArray(scalar)) {
        console.log(
          "A range must be provided for a scalar market. If the eventual resolved answer falls outside of this range either the Long or Short outcome token will be redeemable for exactly 1 ZTG. If it falls within, then both will redeemable for part of 1 ZTG."
        );
        throw new Error("No range was provided to create scalar market.");
      }
      if (scalar.length === 1) {
        if (scalar[0] === "calar") {
          console.log(
            "Did you use the right number of dashes (-s or --scalar) ?"
          );
        }
        console.log(
          "-s / --scalar is an optional multiparameter argument and should be passed after mandatory arguments.\n"
        );
      }
      console.log(
        scalar.length,
        scalar,
        scalar.map(Number),
        scalar.map(Number).some(isNaN)
      );

      throw new Error(
        "A range specified by exactly two numbers (bottom and top) must be provided to create scalar market."
      );
    }
    if (categories) {
      console.log(
        "Categories cannot be specified for a scalar market. The outcomes Long and Short will be used."
      );
    }
  }

  const signer = util.signerFromSeed(seed);
  console.log("Sending transaction from", signer.address);

  const marketId = scalar
    ? await sdk.models.createNewScalarMarket(
        signer,
        title,
        description,
        oracle,
        marketEnd,
        advised ? "Advised" : "Permissionless",
        scalar.map(Number)
      )
    : await sdk.models.createNewCategoricalMarket(
        signer,
        title,
        description,
        oracle,
        marketEnd,
        advised ? "Advised" : "Permissionless",
        categories && categories.length > 1 ? categories : ["Yes", "No"]
      );

  if (marketId) {
    console.log(`Market created! Market Id: ${marketId}`);
  }
};

export default createMarket;
