import SDK, { util } from "@zeitgeistpm/sdk";

type Options = {
  block: string | number;
  endpoint: string;
};

const getAssetsPrices = async (opts: Options): Promise<void> => {
  const { endpoint } = opts;
  let { block } = opts;

  const sdk = await SDK.initialize(endpoint);

  if (block === undefined) {
    const header = await sdk.api.rpc.chain.getHeader();
    block = await header.number.toString();
  }
  const res = await sdk.models.getAssetsPrices(block);

  console.log("Block:", block);
  console.log(res);
};

export default getAssetsPrices;
