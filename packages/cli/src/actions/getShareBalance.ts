import SDK, { util } from "@zeitgeistpm/sdk";

type Options = {
  addressOrSeed: string;
  seed?: string;
  address?: string;
  asset: string;
  endpoint: string;
};

const getShareBalance = async (opts: Options): Promise<void> => {
  // const { addressOrSeed, seed, asset, endpoint } = opts;
  // let address, signer;

  // const sdk = await SDK.initialize(endpoint);

  // if (util.isValidAddress(addressOrSeed || opts.address)) {
  //   address = addressOrSeed || opts.address;
  // } else {
  //   if (seed || addressOrSeed) {
  //     try {
  //       signer = util.signerFromSeed(seed || addressOrSeed);
  //       address = signer.address;
  //       console.log(`Sending transaction from ${address}`);
  //     } catch (e) {
  //       throw new Error(`${seed || addressOrSeed} was not a useable seed.`);
  //     }
  //   } else {
  //     throw new Error("No address or seed provided");
  //   }
  // }

  // if (seed) {
  //   if (opts.address) {
  //     console.log(
  //       `Both an address (${address}) and a seed were provided. The address will be used.`
  //     );
  //   } else {
  //     console.log(`Using ${address} generated from the provided seed`);
  //   }
  // }

  // const data =
  //   asset === "ztg"
  //     ? await sdk.api.query.system.account(address).then((res) => res.data)
  //     : await sdk.api.query.tokens.accounts(
  //         address,
  //         util.AssetIdFromString(asset)
  //       );

  // console.log("", data.toHuman());
};

export default getShareBalance;
