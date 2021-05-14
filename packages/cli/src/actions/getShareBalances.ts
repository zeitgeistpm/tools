// import SDK, { util } from "@zeitgeistpm/sdk";
import SDK, { util } from "../../../sdk/src";

type Options = {
  addressOrSeed: string;
  seed?: string;
  address?: string;
  marketId?: number;
  endpoint: string;
};

const getShareBalances = async (opts: Options): Promise<void> => {
  //@ts-ignore
  const { addressOrSeed, seed, MarketId, endpoint } = opts;
  const assets: any = ["ztg"];
  let address, signer;

  // this is crazy and I don;t understand it :/
  //@ts-ignore
  const marketId = opts.marketId || MarketId;

  const sdk = await SDK.initialize(endpoint);

  if (util.isValidAddress(addressOrSeed || opts.address)) {
    address = addressOrSeed || opts.address;
  } else {
    if (seed || addressOrSeed) {
      try {
        signer = util.signerFromSeed(seed || addressOrSeed);
        address = signer.address;
        console.log(`Sending transaction from ${address}`);
      } catch (e) {
        throw new Error(`${seed || addressOrSeed} was not a useable seed.`);
      }
    } else {
      throw new Error("No address or seed provided");
    }
  }

  if (seed) {
    if (opts.address) {
      console.log(
        `Both an address (${address}) and a seed were provided. The address will be used.`
      );
    } else {
      console.log(`Using ${address} generated from the provided seed`);
    }
  }

  if (marketId) {
    console.log("Fetching outcome assets for market", marketId);

    const market = await sdk.models.fetchMarketData(Number(marketId));
    market.outcomeAssets.forEach((marketAsset) => {
      assets.push(marketAsset.toJSON());
    });
  }

  const balances = assets.map(async (asset) => {
    const data =
      asset === "ztg"
        ? await sdk.api.query.system.account(address).then((res) => res.data)
        : await sdk.api.query.tokens.accounts(
            address,
            util.AssetIdFromString(asset)
          );

    console.log(`\n${address} \nbalance of`, asset.toHuman ? asset.toHuman() : asset);
    console.log("", data.toHuman());
  });

  await Promise.all(balances);
};

export default getShareBalances;
