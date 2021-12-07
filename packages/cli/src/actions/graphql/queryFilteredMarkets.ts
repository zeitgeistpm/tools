import SDK from "@zeitgeistpm/sdk";
import { MarketStatusText } from "@zeitgeistpm/sdk/dist/types";

type Options = {
  endpoint: string;
  graphQlEndpoint: string;
  statuses: MarketStatusText[];
  ordering: "ASC" | "DESC";
  pageNumber: number;
  pageSize: number;
};

const queryFilteredMarkets = async (opts: Options): Promise<void> => {
  const {
    endpoint,
    graphQlEndpoint,
    statuses,
    ordering,
    pageNumber,
    pageSize,
  } = opts;

  const sdk = await SDK.initialize(endpoint, { graphQlEndpoint });

  const res = await sdk.models.filterMarkets(statuses, ordering, {
    pageSize,
    pageNumber,
  });

  for (const market of res) {
    console.log(`\nData for market of id ${market.marketId}\n`);
    console.log(market.toJSONString());
  }
};

export default queryFilteredMarkets;
