import SDK from "@zeitgeistpm/sdk";

type Options = {
  assetIn: string;
  assetOut: string;
  endpoint: string;
  poolId: string;
};

const getSpotPrice = async (opts: Options): Promise<void> => {
  const { endpoint, poolId, assetIn, assetOut } = opts;

  const sdk = await SDK.initialize(endpoint);

  //@ts-ignore
  const price = await sdk.swaps.getSpotPrice(poolId, assetIn, assetOut);

  console.log(price);

  console.log(price.amount.toString());
};

export default getSpotPrice;
