import SDK from "@zeitgeistpm/sdk";
import {
  MarketStatusText,
  MarketsOrdering,
  MarketsOrderBy,
} from "@zeitgeistpm/sdk/dist/types";

type Options = {
  endpoint: string;
  graphQlEndpoint: string;
  statuses: MarketStatusText[];
  tags: string[];
  ordering: MarketsOrdering;
  orderBy: MarketsOrderBy;
  pageNumber: number;
  pageSize: number;
  creator?: string;
  oracle?: string;
};

const queryFilteredMarkets = async (opts: Options): Promise<void> => {
  const {
    endpoint,
    graphQlEndpoint,
    statuses,
    tags,
    ordering,
    orderBy,
    pageNumber,
    pageSize,
    creator,
    oracle,
  } = opts;

  const sdk = await SDK.initialize(endpoint, { graphQlEndpoint });

  const res = await sdk.models.filterMarkets(
    { statuses, creator, oracle, tags },
    {
      ordering,
      orderBy,
      pageSize,
      pageNumber,
    }
  );

  for (const market of res) {
    console.log(`\nData for market of id ${market.marketId}\n`);
    console.log(market.toJSONString());
  }
};

export default queryFilteredMarkets;
