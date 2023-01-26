import { ISubmittableResult } from "@polkadot/types/types";
import {
  DecodedMarketMetadata,
  KeyringPairOrExtSigner,
  MarketDeadlines,
  MarketPeriod,
  MarketTypeOf,
} from ".";

export type CreateCpmmMarketAndDeployAssetsParams = {
  signer: KeyringPairOrExtSigner;
  baseAsset: string;
  oracle: string;
  period: MarketPeriod;
  deadlines: MarketDeadlines;
  metadata: DecodedMarketMetadata;
  marketType: MarketTypeOf;
  disputeMechanism: string;
  swapFee: string;
  amount: string;
  weights: string[];
  callbackOrPaymentInfo:
    | ((result: ISubmittableResult, _unsub: () => void) => void)
    | boolean;
};

export type CreateMarketParams = {
  signer: KeyringPairOrExtSigner;
  baseAsset: string;
  oracle: string;
  period: MarketPeriod;
  deadlines: MarketDeadlines;
  metadata: DecodedMarketMetadata;
  creationType: string;
  marketType: MarketTypeOf;
  disputeMechanism: string;
  scoringRule: string;
  callbackOrPaymentInfo:
    | ((result: ISubmittableResult, _unsub: () => void) => void)
    | boolean;
};
