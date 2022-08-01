import { ISubmittableResult } from "@polkadot/types/types";
import {
  DecodedMarketMetadata,
  KeyringPairOrExtSigner,
  MarketDisputeMechanism,
  MarketPeriod,
  MarketTypeOf,
} from ".";

export type CreateCpmmMarketAndDeployAssetsParams = {
  signer: KeyringPairOrExtSigner;
  oracle: string;
  period: MarketPeriod;
  metadata: DecodedMarketMetadata;
  marketType: MarketTypeOf;
  mdm: MarketDisputeMechanism;
  swapFee: string;
  amount: string;
  weights: string[];
  callbackOrPaymentInfo:
    | ((result: ISubmittableResult, _unsub: () => void) => void)
    | boolean;
};

export type CreateMarketParams = {
  signer: KeyringPairOrExtSigner;
  oracle: string;
  period: MarketPeriod;
  metadata: DecodedMarketMetadata;
  creationType: string;
  marketType: MarketTypeOf;
  mdm: MarketDisputeMechanism;
  scoringRule: string;
  callbackOrPaymentInfo:
    | ((result: ISubmittableResult, _unsub: () => void) => void)
    | boolean;
};
