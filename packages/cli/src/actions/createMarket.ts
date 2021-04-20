import SDK, { util } from "@zeitgeistpm/sdk";

type Options = {
  endpoint: string;
  title: string;
  description: string;
  oracle: string;
  end: string;
  advised: boolean,
  seed: string;
};

const createMarket = async (opts: Options): Promise<void> => {
  const { title, description, oracle, end, advised, endpoint, seed } = opts;

  const sdk = await SDK.initialize(endpoint);

  const signer = util.signerFromSeed(seed);
  console.log("Sending transaction from", signer.address);

  const marketId = await sdk.models.createNewMarket(
    signer,
    title,
    description,
    oracle,
    { block: Number(end) }, // TODO support timestamp
    advised ? "Advised" : "Permissionless",
  );

  console.log(`Market created! Market Id: ${marketId}`);
};

export default createMarket;
