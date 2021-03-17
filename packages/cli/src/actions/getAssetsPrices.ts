import SDK, { util } from "@zeitgeistpm/sdk";

type Options = {
  blockNumber: string;
  endpoint: string;
};

const getAssetsPrices = async (opts: Options): Promise<void> => {
  const { blockNumber, endpoint } = opts;

  const sdk = await SDK.initialize(endpoint);

  const res = await sdk.models.getAssetsPrices(blockNumber);

  console.log(res);
};

export default getAssetsPrices;
