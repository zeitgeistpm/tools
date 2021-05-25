import SDK from "@zeitgeistpm/sdk";

type Options = {
  endpoint: string;
  marketId: string;
};

const viewSwap = async (opts: Options): Promise<void> => {
  const { endpoint, marketId } = opts;

  const sdk = await SDK.initialize(endpoint);

  const market = await sdk.model.fetchMarketData(Number(marketId));
  const poolId = await market.getPoolId();

  if (poolId != 0 && !poolId) {
    throw new Error(`Market ${marketId} has no canonical swap pool.`);
  }

  const pool = await sdk.model.fetchPoolData(poolId);
  const [sharesId, poolAccountId] = await Promise.all([
    pool.sharesId(),
    pool.accountId(),
  ]);
  console.log(`Pool asset type name: ${sharesId}`);
  console.log(
    `poolAccountId: ${poolAccountId} - do not send funds directly to this address!`
  );
  console.log(pool.toJSONString());
};

export default viewSwap;
