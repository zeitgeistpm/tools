// Just a market identifier.
export type MarketId = number;

// The market type as returned by the API call to `predictionMarkets.markets`.
export type MarketResponse = {
  creator: string;
  creation: string;
  creator_fee: number;
  oracle: string;
  end: number;
  metadata: string;
  market_type: string;
  market_status: string;
  reported_outcome: number | null;
  reporter: string | null;
  categories: string[] | null;
}

// The extended market data from which a market may be created.
export type ExtendedMarketResponse = {
  creator: string;
  creation: string;
  creator_fee: number;
  oracle: string;
  end: number;
  metadata: string;
  market_type: string;
  market_status: string;
  reported_outcome: number | null;
  reporter: string | null;
  categories: string[] | null;
  // new ones
  title: string;
  description: string;
  metadataString: string;
  invalidShareId: string;
  yesShareId: string;
  noShareId: string;
}

export enum MarketCreation {
  Permissioned = "Permissioned",
  Advised = "Advised",
};
