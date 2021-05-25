import SDK, { util } from "@zeitgeistpm/sdk";

type Options = {
  endpoint: string;
};

const getAllMarketIds = async (opts: Options): Promise<void> => {
  const { endpoint } = opts;

  const sdk = await SDK.initialize(endpoint);

  const res = await sdk.model.getAllMarketIds();

  console.log(res);
};

export default getAllMarketIds;
