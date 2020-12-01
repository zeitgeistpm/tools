import { models } from "@zeitgeistpm/sdk";
import { signerFromSeed } from "@zeitgeistpm/sdk/dist/util";

type Options = {
  endpoint: string;
  title: string;
  info: string;
  oracle: string;
  seed: string;
};

const createMarket = async (opts: Options): Promise<void> => {
  const { title, info, oracle, seed } = opts;

  console.log("before waiting");
  await new Promise((resolve) => setTimeout(() => resolve(), 200));
  console.log("after waiting");

  const signer = signerFromSeed(seed);
  console.log("sending from", signer.address);

  await models.Market.createNew(signer, title, info, oracle);
};

export default createMarket;
