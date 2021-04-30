import SDK, { util } from "@zeitgeistpm/sdk";

type Options = {
  endpoint: string;
  marketId: string;
  sharesIndex: string;
  to: string;
  amount: string;
  seed: string;
};

const transfer = async (opts: Options): Promise<void> => {
  const { endpoint, marketId, sharesIndex, to, amount, seed } = opts;

  console.log("transfer not implemented for tokens pallet!");

//   const sdk = await SDK.initialize(endpoint);

//   const signer = util.signerFromSeed(seed);

//   const res = await sdk.models.shares.shareTransfer(
//     signer,
//     Number(marketId),
//     Number(sharesIndex),
//     to,
//     amount
//   );

//   console.log(res);
};

export default transfer;
