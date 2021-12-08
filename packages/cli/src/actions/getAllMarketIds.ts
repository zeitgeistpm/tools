import SDK from "@zeitgeistpm/sdk";

type Options = {
  endpoint: string;
};

const getAllMarketIds = async (opts: Options): Promise<void> => {
  const { endpoint } = opts;

  const sdk = await SDK.initialize(endpoint);

  const res = await sdk.models.getAllMarketIds();

  console.log(res);
};

export default getAllMarketIds;
