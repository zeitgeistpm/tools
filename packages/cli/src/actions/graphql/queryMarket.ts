import SDK from "@zeitgeistpm/sdk";

type Options = {
  endpoint: string;
  graphQlEndpoint: string;
  marketId: number;
};

const queryMarket = async (opts: Options): Promise<void> => {
  const { endpoint, graphQlEndpoint, marketId } = opts;

  const sdk = await SDK.initialize(endpoint, { graphQlEndpoint });

  const res = await sdk.models.queryMarket(marketId);

  console.log(res.toJSONString());
};

export default queryMarket;
