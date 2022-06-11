import { KeyringPairOrExtSigner } from ".";
import { ISubmittableResult } from "@polkadot/types/types";

export type SwapExactAmountInParams = {
  signer: KeyringPairOrExtSigner;
  assetIn: string;
  assetAmountIn: string;
  assetOut: string;
  minAmountOut?: string;
  maxPrice?: string;
  callbackOrPaymentInfo:
    | ((result: ISubmittableResult, _unsub: () => void) => void)
    | boolean;
};

export type SwapExactAmountOutParams = {
  signer: KeyringPairOrExtSigner;
  assetIn: string;
  maxAmountIn?: string;
  assetOut: string;
  assetAmountOut: string;
  maxPrice?: string;
  callbackOrPaymentInfo:
    | ((result: ISubmittableResult, _unsub: () => void) => void)
    | boolean;
};
