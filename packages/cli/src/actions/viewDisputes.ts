import SDK, { util } from "@zeitgeistpm/sdk";

type Options = {
  endpoint: string;
  marketId: number;
};

const viewDisputes = async (opts: Options): Promise<void> => {
  const { endpoint, marketId } = opts;

  const sdk = await SDK.initialize(endpoint);

  const disputes = await sdk.models.fetchDisputes(Number(marketId));

  console.log(disputes);
};

export default viewDisputes;
