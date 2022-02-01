import SDK from "@zeitgeistpm/sdk";

type Options = {
  graphQlEndpoint: string;
  endpoint: string;
};

const queryAllActiveAssets = async (opts: Options): Promise<void> => {
  const { endpoint, graphQlEndpoint } = opts;

  const sdk = await SDK.initialize(endpoint, { graphQlEndpoint });

  const res = await sdk.models.queryAllActiveAssets();

  console.log(JSON.stringify(res, undefined, 4));
};

export default queryAllActiveAssets;
