import SDK from "@zeitgeistpm/sdk";

type Options = {
  graphQlEndpoint: string;
  endpoint: string;
  marketSlug?: string;
  pageNumber?: number;
  pageSize?: number;
};

const queryAllActiveAssets = async (opts: Options): Promise<void> => {
  const { endpoint, graphQlEndpoint, marketSlug, pageNumber, pageSize } = opts;

  const sdk = await SDK.initialize(endpoint, { graphQlEndpoint });
  let pagination: { pageSize: number; pageNumber: number };
  if (pageNumber && pageSize) {
    pagination = { pageSize, pageNumber };
  }

  const res = await sdk.models.queryAllActiveAssets(marketSlug, pagination);

  console.log(JSON.stringify(res, undefined, 4));
};

export default queryAllActiveAssets;
