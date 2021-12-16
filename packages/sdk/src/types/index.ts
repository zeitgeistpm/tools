import { KeyringPair } from "@polkadot/keyring/types";
import { Signer } from "@polkadot/types/types";
import { MarketType } from "@zeitgeistpm/types/dist/interfaces/predictionMarkets";
import { Asset } from "@zeitgeistpm/types/dist/interfaces/index";

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
  confidential_id?: string;
  // The image for the market.
  img?: string;
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

// The market type as returned by the API call to `predictionMarkets.markets`.
export type MarketResponse = {
  creator: string;
  creation: MarketCreation;
  creator_fee: number;
  oracle: string;
  metadata?: string;
  market_type: MarketType;
  period: MarketPeriod;
  scoring_rule: ScoringRule;
  status: string;
  report: Report | null;
  resolved_outcome: OutcomeReport | null;
  mdm: MarketDisputeMechanism;
  outcomeAssets: Asset[];
  end: BigInt;
};

// The extended market data from which a market may be created.
export type ExtendedMarketResponse = {
  creator: string;
  creation: MarketCreation;
  creator_fee: number;
  oracle: string;
  period: MarketPeriod;
  scoring_rule: ScoringRule;
  metadata: string;
  market_type: MarketType;
  status: string;
  report: Report | null;
  categories: string[] | null;
  resolved_outcome: OutcomeReport | null;
  mdm: MarketDisputeMechanism;
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
  creator_fee?: number;
  oracle?: string;
  period?: MarketPeriod;
  metadata?: string;
  market_type?: string;
  status?: string;
  report?: Report | null;
  categories?: number | null;
  resolved_outcome?: OutcomeReport | null;
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

export type ScoringRule = "CPMM" | "RikiddoSigmoidFeeMarketEma";

export type MarketDisputeMechanism =
  | { Authorized: number }
  | { Court: null }
  | { SimpleDisputes: null };

export type MarketDispute = {
  at: number;
  by: string;
  outcome: OutcomeReport;
};

export type PoolResponse = {
  assets: string[] | AssetId[];
  swap_fee: number;
  total_weight: number;
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
  | "Reported"
  | "Disputed"
  | "Resolved";

export type MarketsOrdering = "asc" | "desc";

export type MarketsOrderBy = "newest" | "end";
