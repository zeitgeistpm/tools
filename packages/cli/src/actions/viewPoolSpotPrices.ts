import SDK from "@zeitgeistpm/sdk";

type Options = {
  assetIn: string;
  assetOut: string;
  endpoint: string;
  poolId: string;
};

const viewSpotPrices = async (opts: Options): Promise<void> => {
  const { endpoint, poolId, assetIn, assetOut } = opts;

  const sdk = await SDK.initialize(endpoint);

  //@ts-ignore
  const price = await sdk.api.rpc.swaps.fetchPoolSpotPrices(
    poolId,
    assetIn,
    assetOut
  );

  console.log(price.amount.toString());
};

export default viewSpotPrices;
