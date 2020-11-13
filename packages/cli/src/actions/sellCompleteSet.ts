import { models } from "@zeitgeistpm/sdk";
import { signerFromSeed } from "@zeitgeistpm/sdk/dist/util";

type Options = {
  marketId: string;
  amount: string;
  seed: string;
};

const sellCompleteSet = async (opts: Options): Promise<void> => {
  const { marketId, amount, seed } = opts;

  const signer = signerFromSeed(seed);

  const market = await models.Market.getRemote(Number(marketId));
  const res = await market.sellCompleteSet(signer, Number(amount));

  console.log(res);
  return;
};

export default sellCompleteSet;
