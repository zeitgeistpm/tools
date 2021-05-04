import { models } from "@zeitgeistpm/sdk";

type Options = {
  account: string;
  marketId: number;
  shareIndex: number;
};

const getShareBalance = async (opts: Options): Promise<void> => {
  const { account, marketId, shareIndex } = opts;

  console.log("getShareBalance not implemented for tokens pallet!");
};

export default getShareBalance;
