import SDK from "@zeitgeistpm/sdk";

/**
 * Queries count of markets for specified filter options.
 * @param param0 filtering options
 * @returns count of markets for specified filters
 */
async function main() {
  // Initialise the provider to connect to the local node
  // wss://bsr.zeitgeist.pm
  // wss://bp-rpc.zeitgeist.pm
  const ZTGNET = "wss://bsr.zeitgeist.pm";
  const graphQlEndpoint = "https://processor.zeitgeist.pm/graphql";

  const sdk = await SDK.initialize(ZTGNET, { graphQlEndpoint });
  const tag = "Crypto";

  const res = await sdk.models.queryMarketsCount({ tags: [tag] });
  console.log(res);
}

main()
  .catch(console.error)
  .finally(() => process.exit());
