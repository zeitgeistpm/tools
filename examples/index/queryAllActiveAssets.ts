import SDK from "@zeitgeistpm/sdk";

/**
 * Queries all active assets from subsquid indexer.
 * @param marketSlugText Filter assets by market slug
 * @param pagination Options for pagination
 * @returns Data needed for token trading
 */
async function main() {
  // Initialise the provider to connect to the local node
  // wss://bsr.zeitgeist.pm
  // wss://bp-rpc.zeitgeist.pm
  const ZTGNET = "wss://bsr.zeitgeist.pm";
  const graphQlEndpoint = "https://processor.zeitgeist.pm/graphql";

  const sdk = await SDK.initialize(ZTGNET, { graphQlEndpoint });
  const marketId: number = 372;

  // get market slug
  const slug = (await sdk.models.fetchMarketData(marketId)).slug;

  const pageSize = 1;
  const pageNumber = 1;
  let pagination: { pageSize: number; pageNumber: number };
  const res = await sdk.models.queryAllActiveAssets(slug, pagination);
  console.log(res);
}

main()
  .catch(console.error)
  .finally(() => process.exit());
