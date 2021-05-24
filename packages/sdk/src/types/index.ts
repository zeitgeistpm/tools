import { KeyringPair } from "@polkadot/keyring/types";
import { Signer } from "@polkadot/types/types";
import {
  Market,
  MarketType,
  Outcome,
} from "@zeitgeistpm/types/dist/interfaces/predictionMarkets";
import { Asset, Address } from "@zeitgeistpm/types/dist/interfaces/index";

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

export type AssetShortform =
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
export type MarketResponse = Market;

// The extended market data from which a market may be created.
export type ExtendedMarketResponse = {
  creator: string;
  creation: MarketCreation;
  creator_fee: number;
  oracle: string;
  end: MarketEnd;
  metadata: string;
  market_type: MarketType;
  market_status: string;
  report: Report | null;
  categories: string[] | null;
  resolved_outcome: number | null;
  // new ones
  marketId: number;
  title: string;
  description: string;
  metadataString: string;
  outcomeAssets: Asset[];
  poolId?: number | null;
};

// The extended market data from which a market may be created.
export type FilteredMarketResponse = {
  creator?: string;
  creation?: MarketCreation;
  creator_fee?: number;
  oracle?: string;
  end?: MarketEnd;
  metadata?: string;
  market_type?: string;
  market_status?: string;
  report?: Report | null;
  categories?: number | null;
  resolved_outcome?: number | null;
  // new ones
  marketId?: number;
  title?: string;
  description?: string;
  metadataString?: string;
  outcomeAssets?: Asset[];
  poolId?: number | null;
};

export type Report = {
  at: number;
  by: string;
  outcome: Outcome;
};

export type MarketEnd = { block: number } | { timestamp: number };

export type MarketCreation = "Permissioned" | "Advised";

export type MarketDispute = {
  at: number;
  by: string;
  outcome: Outcome;
};

export type PoolResponse = {
  assets: string[] | AssetShortform[];
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
  assetMin: number | number[];
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

export type AssetForgiving = Asset | AssetShortform | string;

export type poolJoinOpts = {
  asset?: AssetForgiving;
  bounds: poolJoinBounds;
};

export type poolExitOpts = {
  asset?: AssetForgiving;
  bounds: poolExitBounds;
};

export type ExtSigner = { address: string; signer: Signer };

export type KeyringPairOrExtSigner = KeyringPair | ExtSigner;

export type BlockHash = string;
