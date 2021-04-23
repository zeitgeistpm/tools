import { KeyringPair } from "@polkadot/keyring/types";
import { Signer } from "@polkadot/types/types";
import { Market, MarketType, Outcome } from "@zeitgeistpm/types/dist/interfaces/predictionMarkets/types";

// Just a market identifier.
export type MarketId = number;

export type CategoricalMarket = {
  categories: number;
}

export type ScalarMarket = {
  lowerBound: number,
  higherBound: number,
}

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
  categories: number | null;
  resolved_outcome: number | null;
  // new ones
  marketId: number;
  title: string;
  description: string;
  metadataString: string;
  outcomeAssets: any;
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
  shareIds?: string[];
};

export type Report = {
  at: number;
  by: string;
  outcome: number;
};

export type MarketEnd = { block: number } | { timestamp: number };

export type MarketCreation = "Permissioned" | "Advised";

export type MarketDispute = {
  at: number;
  by: string;
  outcome: number;
};

export type PoolResponse = {
  assets: string[];
  swap_fee: number;
  total_weight: number;
  weights: any; // { string => number } TODO how to do repr this in TS?
};

export type PoolId = number;

export type ExtSigner = { address: string; signer: Signer };

export type KeyringPairOrExtSigner = KeyringPair | ExtSigner;
