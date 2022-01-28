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
  slug: string;
  question: string;
  tags: string[];
  ordering: MarketsOrdering;
  orderBy: MarketsOrderBy;
  pageNumber: number;
  pageSize: number;
  creator?: string;
  oracle?: string;
  liquidityOnly?: boolean;
};

const queryFilteredMarkets = async (opts: Options): Promise<void> => {
  const {
    endpoint,
    graphQlEndpoint,
    statuses,
    tags,
    slug,
    question,
    ordering,
    orderBy,
    pageNumber,
    pageSize,
    creator,
    oracle,
    liquidityOnly,
  } = opts;

  const sdk = await SDK.initialize(endpoint, { graphQlEndpoint });

  const { result, count } = await sdk.models.filterMarkets(
    { statuses, creator, oracle, tags, slug, question, liquidityOnly },
    {
      ordering,
      orderBy,
      pageSize,
      pageNumber,
    }
  );

  for (const market of result) {
    console.log(`\nData for market of id ${market.marketId}\n`);
    console.log(market.toJSONString());
  }

  console.log("Total count:", count);
};

export default queryFilteredMarkets;
