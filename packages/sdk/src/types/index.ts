import { KeyringPair } from "@polkadot/keyring/types";
import { Signer } from "@polkadot/types/types";
import { Asset, MarketType } from "@zeitgeistpm/types/dist/interfaces/index";

// The possible fields available on the decoded market metadata.
export type DecodedMarketMetadata = {
  // The short name for the market, ex. 'TEAM 1 v.s TEAM 2'.
  slug: string;
  // The question for the market, capped at 160 chars.
  question: string;
  // The complete description of the market including all details.
  description: string;
  // If the market is categorical this field will contain the category data.
  categories?: CategoryMetadata[];
  // Tags for the market.
  tags?: string[];
  // If this field is present and contains content, the market is encrypted.
  // An identifier is placed in this field to denote what key the client should
  // use. E.g. this field might contain "us-gov:22313" to denote a decryption
  // key attached to this identity will decrypt the data.
  confidentialId?: string;
  // The image for the market.
  img?: string;
  // Type of scalar range if market is of type scaler.
  scalarType?: ScalarRangeType;
};

export type CategoryMetadata = {
  name: string;
  ticker?: string;
  img?: string;
  color?: string;
};

// Just a market identifier.
export type MarketId = number;

export type CategoricalMarket = {
  categories: number;
};

export type ScalarMarket = {
  lowerBound: number;
  higherBound: number;
};

export type ScalarRangeType = "number" | "date";

export type OutcomeIndex = [number, number | string];

type categoricalOutcomeIndex = [number, number];

type scalarOutcomeIndex = [number, "Long" | "Short"];

export type CurrencyIdOf =
  | CategoricalOutcome
  | ScalarOutcome
  | {
      CombinatorialOutcome: null;
    }
  | {
      Ztg: null;
    }
  | {
      PoolShare: number;
    };

export type AssetId =
  | CategoricalOutcome
  | ScalarOutcome
  | {
      ztg: null;
    }
  | {
      poolShare: number;
    };

export type CategoricalOutcome = {
  categoricalOutcome: categoricalOutcomeIndex;
};

export type ScalarOutcome = {
  scalarOutcome: scalarOutcomeIndex;
};

export type FilteredPoolsListResponse = {
  pools: {
    poolId: number;
    account: string;
    totalWeight: string;
    weights: { assetId: string; len: number }[];
    marketId: number;
  }[];
};

export type FilteredPoolsListItem = {
  assets: {
    assetId: AssetId;
    percentage: number;
    category:
      | string
      | { ticker: string; name: string; img?: string; color: string };
    poolId: number;
    price: number;
    amountInPool: string;
  }[];
  liquidity: number;
  poolId: number;
  account: string;
  totalWeight: string;
  weights: { assetId: string; len: number }[];
  marketId: number;
  marketSlug: string;
};

// The market type as returned by the API call to `predictionMarkets.markets`.
export type MarketResponse = {
  creator: string;
  creation: MarketCreation;
  creatorFee: number;
  oracle: string;
  metadata?: string;
  marketType: MarketType;
  period: MarketPeriod;
  scoringRule: ScoringRule;
  status: string;
  report: Report | null;
  resolvedOutcome: OutcomeReport | null;
  disputeMechanism: MarketDisputeMechanism;
  outcomeAssets: Asset[];
  end: BigInt;
};

// The extended market data from which a market may be created.
export type ExtendedMarketResponse = {
  creator: string;
  creation: MarketCreation;
  creatorFee: number;
  oracle: string;
  period: MarketPeriod;
  scoringRule: ScoringRule;
  metadata: string;
  marketType: MarketType;
  status: string;
  report: Report | null;
  categories: string[] | null;
  resolvedOutcome: OutcomeReport | null;
  disputeMechanism: MarketDisputeMechanism;
  // new ones
  marketId: number;
  title: string;
  description: string;
  metadataString: string;
  outcomeAssets: Asset[];
};

// The extended market data from which a market may be created.
export type FilteredMarketResponse = {
  creator?: string;
  creation?: MarketCreation;
  creatorFee?: number;
  oracle?: string;
  period?: MarketPeriod;
  metadata?: string;
  marketType?: string;
  status?: string;
  report?: Report | null;
  categories?: number | null;
  resolvedOutcome?: OutcomeReport | null;
  // new ones
  marketId?: number;
  title?: string;
  description?: string;
  metadataString?: string;
  outcomeAssets?: Asset[];
};

export type Report = {
  at: number;
  by: string;
  outcome: OutcomeReport;
};

export type OutcomeReport = { categorical: number } | { scalar: number };

export type MarketPeriod = { block: number[] } | { timestamp: number[] };

export type MarketEnd = { block: number } | { timestamp: number };

export type MarketCreation = "Permissioned" | "Advised";

export type MarketTypeOf = { Categorical: number } | { Scalar: number[] };

export type ScoringRule = "CPMM" | "RikiddoSigmoidFeeMarketEma";

export type AuthorisedDisputeMechanism = { authorized: string };

export type CourtDisputeMechanism = { Court: null };

export type SimpleDisputeMechanism = { SimpleDisputes: null };

export type MarketDisputeMechanism =
  | AuthorisedDisputeMechanism
  | CourtDisputeMechanism
  | SimpleDisputeMechanism;

export type MarketDispute = {
  at: number;
  by: string;
  outcome: OutcomeReport;
};

export type PoolResponse = {
  assets: string[] | AssetId[];
  swapFee: number;
  totalWeight: number;
  weights: any; // { string => number } TODO how to do repr this in TS?
};

interface PoolJoinOrExitIncomplete {
  amount: number;
}

interface PoolJoinForMaxAsset extends PoolJoinOrExitIncomplete {
  poolAmount: number;
  assetAmount?: never;
  poolMin?: never;
  assetMax: number | number[];
  assetMin?: never;
  poolMax?: never;
}

interface PoolJoinForMinPool extends PoolJoinOrExitIncomplete {
  poolAmount?: never;
  assetAmount: number;
  poolMin: number;
  assetMax?: never;
  assetMin?: never;
  poolMax?: never;
}

interface PoolExitForMinAsset extends PoolJoinOrExitIncomplete {
  poolAmount: number;
  assetAmount?: never;
  poolMin?: never;
  assetMax?: never;
  assetMin: number;
  poolMax?: never;
}

interface PoolExitForMaxPool extends PoolJoinOrExitIncomplete {
  poolAmount?: never;
  assetAmount: number;
  poolMin?: never;
  assetMax?: never;
  assetMin?: never;
  poolMax: number;
}

export type poolJoinBounds = PoolJoinForMaxAsset | PoolJoinForMinPool;

export type poolExitBounds = PoolExitForMinAsset | PoolExitForMaxPool;

export type PoolId = number;

export type AssetIdStringForTempCompatibility = string;

export type poolJoinOpts = {
  asset?: AssetIdStringForTempCompatibility;
  bounds: poolJoinBounds;
};

export type poolExitOpts = {
  asset?: AssetIdStringForTempCompatibility;
  bounds: poolExitBounds;
};

export type ExtSigner = { address: string; signer: Signer };

export type KeyringPairOrExtSigner = KeyringPair | ExtSigner;

export type MarketIdOf = MarketId;

export type MarketStatusText =
  | "Proposed"
  | "Active"
  | "Closed"
  | "Reported"
  | "Disputed"
  | "Resolved";

export type MarketsOrdering = "asc" | "desc";

export type MarketsOrderBy = "newest" | "end";

export type MarketsFilteringOptions = {
  statuses?: MarketStatusText[];
  tags?: string[];
  searchText?: string;
  creator?: string;
  oracle?: string;
  liquidityOnly?: boolean;
  // get markets for which supplied account address owns some of the market's assets
  assetOwner?: string;
};

export type MarketsPaginationOptions = {
  ordering: MarketsOrdering;
  orderBy: MarketsOrderBy;
  pageSize: number;
  pageNumber: number;
};

export type ActiveAssetsResponse = {
  baseWeight: number;
  weight: number;
  marketId: number;
  poolAccount: string;
  poolId: number;
  assetId: AssetId;
  marketSlug: string;
  swapFee: string;
  metadata: { ticker: string; name: string; color: string };
  qty: string;
  price: number;
}[];

export * from "./guards";
