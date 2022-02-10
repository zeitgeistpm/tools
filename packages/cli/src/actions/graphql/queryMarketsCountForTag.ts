import SDK from "@zeitgeistpm/sdk";
import { MarketsOrderBy, MarketsOrdering } from "@zeitgeistpm/sdk/dist/types";

type Options = {
  endpoint: string;
  graphQlEndpoint: string;
  tag: string;
};

const queryMarketsCountForTag = async (opts: Options): Promise<void> => {
  const { endpoint, graphQlEndpoint, tag } = opts;

  const sdk = await SDK.initialize(endpoint, { graphQlEndpoint });

  const count = await sdk.models.queryMarketsCount( { tags: [tag]});

  console.log('Count: ', count);
};

export default queryMarketsCountForTag;
