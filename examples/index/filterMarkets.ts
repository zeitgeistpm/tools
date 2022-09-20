import SDK from "@zeitgeistpm/sdk";
import {
  MarketsFilteringOptions,
  MarketStatusText,
} from "@zeitgeistpm/sdk/dist/types";

/**
 * Queries subsquid indexer for market data with pagination.
 * @param param0 filtering options
 * @param paginationOptions pagination options
 * @returns collection of markets and total count for specified options
 */
async function main() {
  // Initialise the provider to connect to the local node
  // wss://bsr.zeitgeist.pm
  // wss://bp-rpc.zeitgeist.pm
  const ZTGNET = "wss://bsr.zeitgeist.pm";
  const graphQlEndpoint = "https://processor.zeitgeist.pm/graphql";

  const sdk = await SDK.initialize(ZTGNET, { graphQlEndpoint });

  const active: MarketStatusText = "Active";
  const statuses = [active];
  const tags = ["Crypto"];
  const liquidityOnly = true;
  const ordering = "desc";
  const orderBy = "newest";
  const pageSize = 10;
  const pageNumber = 1;
  const marketsFilter: MarketsFilteringOptions = {
    statuses: statuses,
    // tags: tags,
    liquidityOnly: liquidityOnly,
  };
  const { result, count } = await sdk.models.filterMarkets(marketsFilter, {
    ordering,
    orderBy,
    pageSize,
    pageNumber,
  });

  for (const market of result) {
    console.log(`\nData for market of id ${market.marketId}\n`);
    console.log(market.toJSONString());
  }

  console.log("Total count:", count);
}

main()
  .catch(console.error)
  .finally(() => process.exit());
