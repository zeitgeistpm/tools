import SDK, { util } from "@zeitgeistpm/sdk";

type Options = {
  addressOrSeed: string;
  seed?: string;
  address?: string;
  asset: string;
  endpoint: string;
};

const tolerantJsonParse = (anything) => {
  try {
    return JSON.parse(anything);
  } catch (e) {
    throw new Error("asset was not ztg, poolX or valid JSON");
  }
};

const string48OrFalse = (address) =>
  typeof address === "string" && address.length === 48 && address;

const parseAssetName = (stringAsset) => {
  console.log("asset (input):", stringAsset);

  // asset= ztg
  if (stringAsset === "ztg") {
    return { ztg: null };
  }

  // asset= pool:x | poolx | poolShare:x | poolShareX
  if (typeof stringAsset === "string") {
    const poolId = stringAsset.replace(/pool(share)?\:?/i, "");
    if (!isNaN(Number(poolId))) {
      return { poolShare: poolId };
    }
  }

  // asset= [x,y] | [x,'Long'|'Short']
  const asset =
    typeof stringAsset === "string"
      ? tolerantJsonParse(stringAsset)
      : stringAsset;

  // asset= [x,y] | [x,'Long'|'Short']
  if (Array.isArray(asset) && asset.length === 2) {
    if (isNaN(Number(asset[0]))) {
      throw new Error("In [market,outcome] market must be a number");
    }
    switch (asset[1]) {
      case "Long":
        return { scalarOutcome: asset };
      case "Short":
        return { scalarOutcome: asset };
      default: {
        if (isNaN(Number(asset[0]))) {
          throw new Error(
            `In [market,outcome] only numerical values, or "Long", "Short" are supported for outcome`
          );
        }
        return { categoricalOutcome: asset };
      }
    }
  }

  throw new Error(
    `Could not parse asset "${stringAsset}". Try ztg, [X,Y], '[X,"Long"]', '[X,"Short"]', poolX.`
  );
};

const getShareBalance = async (opts: Options): Promise<void> => {
  const { addressOrSeed, seed, asset, endpoint } = opts;
  let address, signer;

  const sdk = await SDK.initialize(endpoint);

  if (string48OrFalse(addressOrSeed || opts.address)) {
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

  // temporary
  if (asset !== "ztg") {
    console.log("asset (output):", parseAssetName(asset));
  }

  const data =
    asset === "ztg"
      ? await sdk.api.query.system.account(address).then((res) => res.data)
      : await sdk.api.query.tokens.accounts(address, parseAssetName(asset));

  console.log("", data.toJSON());
};

export default getShareBalance;
