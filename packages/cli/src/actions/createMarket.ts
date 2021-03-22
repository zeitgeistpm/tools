import SDK, { util } from "@zeitgeistpm/sdk";

type Options = {
  endpoint: string;
  title: string;
  description: string;
  oracle: string;
  end: string;
  categories: string;
  seed: string;
};

const createMarket = async (opts: Options): Promise<void> => {
  const { endpoint, title, description, oracle, end, categories, seed } = opts;

  const sdk = await SDK.initialize(endpoint);

  const signer = util.signerFromSeed(seed);
  console.log("Sending transaction from", signer.address);

  const marketId = await sdk.models.createNewMarket(
    signer,
    title,
    description,
    oracle,
    Number(end),
    Number(categories)
  );

  console.log(`Market created! Market Id: ${marketId}`);
};

export default createMarket;
