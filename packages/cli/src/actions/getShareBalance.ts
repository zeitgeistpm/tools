import { models } from "@zeitgeistpm/sdk";

type Options = {
  account: string;
  marketId: number;
  shareIndex: number;
};

const getShareBalance = async (opts: Options): Promise<void> => {
  const { account, marketId, shareIndex } = opts;

  console.log("getShareBalance not implemented for tokens pallet!")

  // const balance = await models.Shares.externBalanceOf(
  //   marketId,
  //   shareIndex,
  //   account
  // );

  // console.log(`Balance: ${balance}`);
};

export default getShareBalance;
