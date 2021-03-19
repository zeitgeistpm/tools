import { KeyringPair } from "@polkadot/keyring/types";
import { Signer } from "@polkadot/types/types";

// Just a market identifier.
export type MarketId = number;

// The market type as returned by the API call to `predictionMarkets.markets`.
export type MarketResponse = {
  creator: string;
  creation: MarketCreation;
  creator_fee: number;
  oracle: string;
  end: MarketEnd;
  metadata: string;
  market_type: string;
  market_status: string;
  reported_outcome: number | null;
  reporter: string | null;
  categories: number | null;
};

// The extended market data from which a market may be created.
export type ExtendedMarketResponse = {
  creator: string;
  creation: MarketCreation;
  creator_fee: number;
  oracle: string;
  end: MarketEnd;
  metadata: string;
  market_type: string;
  market_status: string;
  reported_outcome: number | null;
  reporter: string | null;
  categories: number | null;
  // new ones
  marketId: number;
  title: string;
  description: string;
  metadataString: string;
  shareIds: string[];
};

export type MarketEnd = { Block: number } | { Timestamp: number };

export type MarketCreation = "Permissioned" | "Advised";

export type MarketDispute = {
  at: number;
  by: string;
  outcome: number;
}

export type PoolResponse = {
  assets: string[];
  swap_fee: number;
  total_weight: number;
  weights: any; // { string => number } TODO how to do repr this in TS?
};

export type PoolId = number;

export type ExtSigner = { address: string; signer: Signer };

export type KeyringPairOrExtSigner = KeyringPair | ExtSigner;
