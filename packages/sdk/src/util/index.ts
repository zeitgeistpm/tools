import { ISubmittableResult } from "@polkadot/types/types";
import { SubmittableExtrinsic } from "@polkadot/api/types";
import {
  initApi,
  signerFromSeed,
  unsubOrWarns,
  isValidAddress,
} from "./polkadot";
import {
  KeyringPairOrExtSigner,
  ExtSigner,
  AssetId,
  MarketResponse,
  DecodedMarketMetadata,
  MarketId,
} from "../types";
import IPFS from "../storage/ipfs";
import { Asset, MarketType } from "@zeitgeistpm/types/dist/interfaces";
import { ApiPromise } from "@polkadot/api";
import { Market } from "../models";
import ErrorTable from "../errorTable";

export { initApi, signerFromSeed, unsubOrWarns, isValidAddress };

export const changeEndianness = (string) => {
  const result = [];
  let len = string.length - 2;
  while (len >= 0) {
    result.push(string.substr(len, 2));
    len -= 2;
  }
  return result.join("");
};

export const isExtSigner = (
  signer: KeyringPairOrExtSigner
): signer is ExtSigner => {
  return (signer as ExtSigner).signer !== undefined;
};

const tolerantJsonParse = (anything) => {
  try {
    return JSON.parse(anything);
  } catch (e) {
    throw new Error("asset was not ztg, poolX or valid JSON");
  }
};

export const AssetIdFromString = (stringAsset: string | AssetId): AssetId => {
  // asset= ztg

  if (typeof stringAsset === "string" && stringAsset.toLowerCase() === "ztg") {
    return { ztg: null };
  }

  // asset= pool:x | poolx | poolShare:x | poolShareX
  if (typeof stringAsset === "string") {
    const poolId = stringAsset.replace(/pool(share)?\:?/i, "");
    if (!isNaN(Number(poolId))) {
      return { poolShare: Number(poolId) };
    }
  }

  // asset= [x,y] | [x,'Long'|'Short'] | AssetId
  const asset =
    typeof stringAsset === "string"
      ? tolerantJsonParse(stringAsset)
      : stringAsset;

  // asset= [x,y] | [x,'Long'|'Short']
  if (Array.isArray(asset) && asset.length === 2) {
    if (isNaN(Number(asset[0]))) {
      throw new Error("In [market,outcome] market must be a number");
    }
    asset[0] = Number(asset[0]);

    // @ts-ignore
    if (["Long", "Short"].includes(asset[1])) {
      // @ts-ignore
      return { scalarOutcome: asset };
    }
    if (isNaN(Number(asset[0]))) {
      throw new Error(
        `In [market,outcome] only numerical values, or "Long", "Short" are supported for outcome`
      );
    }
    // @ts-ignore
    return { categoricalOutcome: asset.map(Number) };
  }

  // function accepts valid AssetId as well as string, so let's cover those
  if (typeof asset === "object" && !Array.isArray(asset)) {
    if (asset.ztg === null) {
      return { ztg: null };
    }
    if (typeof asset.poolShare === "number") {
      return { poolShare: asset.poolShare };
    }
    if (
      typeof asset.categoricalOutcome?.[0] === "number" &&
      typeof asset.categoricalOutcome?.[1] === "number"
    ) {
      return { categoricalOutcome: asset.categoricalOutcome.slice(0, 2) };
    }
    if (
      typeof asset.scalarOutcome[0] === "number" &&
      ["Long", "Short"].includes(asset.scalarOutcome[1])
    ) {
      return { scalarOutcome: asset.scalarOutcome.slice(0, 2) };
    }
  }

  throw new Error(
    `Could not parse asset "${stringAsset}". Try ztg, [X,Y], '[X,"Long"]', '[X,"Short"]', poolX.`
  );
};

export const estimatedFee = async (
  tx: SubmittableExtrinsic<"promise", ISubmittableResult>,
  address: string
) => {
  const info = await tx.paymentInfo(address);
  return info.partialFee.toString();
};

const createAssetsForMarket = (
  marketId: MarketId,
  marketType: MarketType | null,
  api: ApiPromise
): Asset[] => {
  return marketType?.isCategorical
    ? [...Array(marketType.asCategorical.toNumber()).keys()].map((catIdx) => {
        return api.createType("Asset", {
          categoricalOutcome: [marketId, catIdx],
        });
      })
    : ["Long", "Short"].map((pos) => {
        const position = api.createType("ScalarPosition", pos);
        return api.createType("Asset", {
          scalarOutcome: [marketId, position.toString()],
        });
      });
};

export const createMarket = async (
  id: number,
  marketRaw: any,
  api: ApiPromise,
  ipfsClient: IPFS,
  errorTable: ErrorTable
) => {
  const marketJson = marketRaw.toJSON() as never as MarketResponse;

  if (!marketJson) {
    throw new Error(`Market with market id ${id} does not exist.`);
  }

  const basicMarketData: MarketResponse = { ...marketJson };
  const { metadata: metadataString } = basicMarketData;

  // Default to no metadata, but actually parse it below if it exists.
  let metadata = {
    slug: "No metadata",
  } as Partial<DecodedMarketMetadata>;

  try {
    if (metadataString) {
      const raw = await ipfsClient.read(metadataString);

      const parsed = JSON.parse(raw) as DecodedMarketMetadata;
      metadata = parsed;
    }
  } catch (err) {
    console.error(err);
  }

  //@ts-ignore
  const market = marketRaw.unwrap();

  basicMarketData.outcomeAssets = createAssetsForMarket(
    id,
    market.marketType,
    api
  );

  basicMarketData.report = market.report.isSome ? market.report.value : null;
  basicMarketData.resolvedOutcome = market.resolvedOutcome.isSome
    ? market.resolvedOutcome.value.toNumber()
    : null;

  return new Market(
    id,
    basicMarketData,
    metadata as DecodedMarketMetadata,
    api,
    errorTable
  );
};
