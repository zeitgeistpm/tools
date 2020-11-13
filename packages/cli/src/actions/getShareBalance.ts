import { models } from "@zeitgeistpm/sdk";

type Options = {
  account: string;
  marketId: number;
  shareIndex: number;
};

const getShareBalance = async (opts: Options): Promise<void> => {
  const { account, marketId, shareIndex } = opts;

  const balance = await models.Shares.balanceOf(marketId, shareIndex, account);

  console.log(`Balance: ${balance}`);
};

export default getShareBalance;
