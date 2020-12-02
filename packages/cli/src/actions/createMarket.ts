import SDK, { util } from "@zeitgeistpm/sdk";

type Options = {
  endpoint: string;
  title: string;
  description: string;
  oracle: string;
  seed: string;
};

const createMarket = async (opts: Options): Promise<void> => {
  const { endpoint, title, description, oracle, seed } = opts;

  const sdk = await SDK.initialize(endpoint);

  console.log("before waiting");
  await new Promise((resolve) => setTimeout(() => resolve(), 200));
  console.log("after waiting");

  const signer = util.signerFromSeed(seed);
  console.log("sending from", signer.address);

  await sdk.models.createNewMarket(signer, title, description, oracle);
};

export default createMarket;
