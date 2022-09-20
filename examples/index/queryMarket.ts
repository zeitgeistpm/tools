import SDK from "@zeitgeistpm/sdk";

/**
 * @param marketId market identifier
 * @returns [[Market]] for specified identifier
 */
async function main() {
  // Initialise the provider to connect to the local node
  // wss://bsr.zeitgeist.pm
  // wss://bp-rpc.zeitgeist.pm
  const ZTGNET = "wss://bsr.zeitgeist.pm";
  const graphQlEndpoint = "https://processor.zeitgeist.pm/graphql";

  const sdk = await SDK.initialize(ZTGNET, { graphQlEndpoint });
  const marketId: number = 1;

  const res = await sdk.models.queryMarket(marketId);
  console.log(res.toJSONString());
}

main()
  .catch(console.error)
  .finally(() => process.exit());
