// import SDK, { util } from "@zeitgeistpm/sdk";
import SDK, { util } from "../../../sdk";

type Options = {
  block: string | number;
  endpoint: string;
};

const getAssetsPrices = async (opts: Options): Promise<void> => {
  const { block, endpoint } = opts;

  const sdk = await SDK.initialize(endpoint);

  const blockHash = block ? await sdk.api.rpc.chain.getBlockHash(block) : null;

  const res = await sdk.models.assetSpotPricesInZtg(blockHash);

  if (block) {
    console.log("Block:", block);
  }
  console.log(res);
};

export default getAssetsPrices;
