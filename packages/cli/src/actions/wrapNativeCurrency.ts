import SDK, { util } from "@zeitgeistpm/sdk";

type Options = {
  amount: string;
  endpoint: string;
  seed: string;
};

const wrapNativeCurrency = async (opts: Options): Promise<void> => {
  const { amount, endpoint, seed } = opts;

  console.log("wrapNativeCurrency not implemented for tokens pallet!");

  // const sdk = await SDK.initialize(endpoint);

  // const signer = util.signerFromSeed(seed);
  // console.log("Sending transaction from", signer.address);

  // const res = await sdk.models.shares.wrapNativeCurrency(signer, amount);

  // console.log(res);
  // console.log("!!!");
};

export default wrapNativeCurrency;
