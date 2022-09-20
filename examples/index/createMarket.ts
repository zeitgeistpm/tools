import SDK, { util } from "@zeitgeistpm/sdk";
import {
  AuthorisedDisputeMechanism,
  CategoryMetadata,
  DecodedMarketMetadata,
  MarketPeriod,
} from "@zeitgeistpm/sdk/dist/types";
import { CreateMarketParams } from "@zeitgeistpm/sdk/dist/types/market";

async function main() {
  // Initialise the provider to connect to the local node
  // wss://bsr.zeitgeist.pm
  // wss://bp-rpc.zeitgeist.pm
  const ZTGNET = "wss://bsr.zeitgeist.pm";
  const sdk = await SDK.initialize(ZTGNET);

  // Generate signer based on seed
  const seed = "";
  const signer = util.signerFromSeed(seed);
  console.log("Sending transaction from", signer.address);

  // Construct Market metadata
  const description = "description for test";
  const slug = "test";
  const question = "Will this test work?";
  const categoriesMeta: CategoryMetadata[] = [
    { name: "Yes", ticker: "YES" },
    { name: "No", ticker: "NO" },
  ];

  const metadata: DecodedMarketMetadata = {
    description,
    slug,
    question,
    categories: categoriesMeta,
  };

  const oracle = "5CS2Q1XbRR1eYnxeXUm8fqq6PfK3WLfwUvCpNvGsYAjKtsUC";
  const period = "1000000";
  const marketPeriod: MarketPeriod = {
    block: period.split(" ").map((x) => +x),
  };
  const mdm: AuthorisedDisputeMechanism = { authorized: "1" };
  const creationType = "Advised";
  const scoringRule = "CPMM";
  const marketType = { Categorical: categoriesMeta.length };

  const params: CreateMarketParams = {
    signer: signer,
    oracle: oracle,
    period: marketPeriod,
    metadata: metadata,
    creationType: creationType,
    marketType: marketType,
    disputeMechanism: mdm,
    scoringRule: scoringRule,
    callbackOrPaymentInfo: false,
  };

  const marketId = await sdk.models.createMarket(params);
  console.log(`Categorical market created! Market Id: ${marketId}`);
}

main()
  .catch(console.error)
  .finally(() => process.exit());
