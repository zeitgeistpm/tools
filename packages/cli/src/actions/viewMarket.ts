import { models } from "@zeitgeistpm/sdk";

type Options = {
  endpoint: string;
  marketId: string;
};

const viewMarket = async (opts: Options): Promise<void> => {
  const { marketId } = opts;

  const market = await models.Market.getRemote(Number(marketId));

  console.log(JSON.stringify(market, null, 2));
};

export default viewMarket;
