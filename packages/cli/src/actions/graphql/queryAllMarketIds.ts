import SDK from "@zeitgeistpm/sdk";

type Options = {
  endpoint: string;
  graphQlEndpoint: string;
};

const queryAllMarketIds = async (opts: Options): Promise<void> => {
  const { endpoint, graphQlEndpoint } = opts;

  const sdk = await SDK.initialize(endpoint, { graphQlEndpoint });

  const res = await sdk.models.getAllMarketIds();

  console.log(res);
};

export default queryAllMarketIds;
