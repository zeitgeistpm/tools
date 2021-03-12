import { ApiPromise } from "@polkadot/api";
import { ISubmittableResult } from "@polkadot/types/types";

import { KeyringPairOrExtSigner, PoolResponse } from "../types";
import { isExtSigner } from "../util";

/**
 * The Swap class provides an interface over the `Swaps` module for
 * providing liquidity to pools and swapping assets.
 */
export default class Swap {
  public assets;
  public swapFee;
  public totalWeight;
  public weights;
  public poolId;

  /** Internally hold a reference to the API that created it. */
  private api: ApiPromise;

  constructor(poolId: number, details: PoolResponse, api: ApiPromise) {
    const { assets, swap_fee, total_weight, weights } = details;

    this.assets = assets;
    this.swapFee = swap_fee;
    this.totalWeight = total_weight;
    this.weights = weights;

    this.poolId = poolId;

    this.api = api;
  }

  /**
   * Returns this object as a nicely formatted JSON string.
   */
  public toJSONString(): string {
    const swap = Object.assign({}, this);
    delete swap.api;
    return JSON.stringify(swap, null, 2);
  }

  public async getSpotPrice(inAsset: string, outAsset: string): Promise<any> {
    //@ts-ignore
    const res = await this.api.rpc.swaps.getSpotPrice(
      this.poolId,
      inAsset,
      outAsset
    );

    return res;
  }

  public async sharesId(): Promise<any> {
    //@ts-ignore
    const res = await this.api.rpc.swaps.poolSharesId(this.poolId);

    return res;
  }

  public async accountId(): Promise<any> {
    //@ts-ignore
    const res = await this.api.rpc.swaps.poolAccountId(this.poolId);

    return res;
  }

  joinPool = async (
    signer: KeyringPairOrExtSigner,
    poolAmountOut: string,
    maxAmountsIn: string[],
    callback?: (result: ISubmittableResult) => void
  ): Promise<boolean> => {
    const _callback = (
      result: ISubmittableResult,
      _resolve: (value: boolean | PromiseLike<boolean>) => void
    ) => {
      const { status } = result;

      if (status.isInBlock) {
        _resolve(true);
      }
    };

    const tx = this.api.tx.swaps.joinPool(
      this.poolId,
      poolAmountOut,
      maxAmountsIn
    );

    return new Promise(async (resolve) => {
      let unsub;
      if (isExtSigner(signer)) {
        unsub = await tx.signAndSend(
          signer.address,
          { signer: signer.signer },
          (result) => {
            callback
              ? callback(result)
              : _callback(result, resolve);
          }
        );
      } else {
        unsub = await tx.signAndSend(signer, (result) => {
          callback
            ? callback(result)
            : _callback(result, resolve);
        });
      }

      setTimeout(() => {
        unsub();
      }, 20000);
    });
  };

  exitPool = async (
    signer: KeyringPairOrExtSigner,
    poolAmountIn: string,
    minAmountsOut: string[],
    callback?: (result: ISubmittableResult) => void
  ): Promise<boolean> => {
    const _callback = (
      result: ISubmittableResult,
      _resolve: (value: boolean | PromiseLike<boolean>) => void
    ) => {
      const { status } = result;

      if (status.isInBlock) {
        _resolve(true);
      }
    };

    const tx = this.api.tx.swaps.exitPool(
      this.poolId,
      poolAmountIn,
      minAmountsOut
    );

    return new Promise(async (resolve) => {
      let unsub;
      if (isExtSigner(signer)) {
        unsub = await tx.signAndSend(
          signer.address,
          { signer: signer.signer },
          (result) => {
            callback
              ? callback(result)
              : _callback(result, resolve);
          }
        );
      } else {
        unsub = await tx.signAndSend(signer, (result) => {
          callback
            ? callback(result)
            : _callback(result, resolve);
        });
      }
      
      setTimeout(() => {
        unsub();
      }, 20000);
    });
  };

  swapExactAmountIn = async (
    signer: KeyringPairOrExtSigner,
    assetIn: string,
    assetAmountIn: string,
    assetOut: string,
    minAmountOut: string,
    maxPrice: string,
    callback?: (result: ISubmittableResult) => void
  ): Promise<boolean> => {
    const _callback = (
      result: ISubmittableResult,
      _resolve: (value: boolean | PromiseLike<boolean>) => void
    ) => {
      const { status } = result;

      if (status.isInBlock) {
        _resolve(true);
      }
    };

    const tx = this.api.tx.swaps.swapExactAmountIn(
      this.poolId,
      assetIn,
      assetAmountIn,
      assetOut,
      minAmountOut,
      maxPrice
    );

    return new Promise(async (resolve) => {
      let unsub;
      if (isExtSigner(signer)) {
        unsub = await tx.signAndSend(
          signer.address,
          { signer: signer.signer },
          (result) => {
            callback
              ? callback(result)
              : _callback(result, resolve);
          }
        );
      } else {
        unsub = await tx.signAndSend(signer, (result) => {
          callback
            ? callback(result)
            : _callback(result, resolve);
        });
      }
      
      setTimeout(() => {
        unsub();
      }, 20000);
    });
  };

  swapExactAmountOut = async (
    signer: KeyringPairOrExtSigner,
    assetIn: string,
    maxAmountIn: string,
    assetOut: string,
    assetAmountOut: string,
    maxPrice: string,
    callback?: (result: ISubmittableResult) => void
  ): Promise<boolean> => {
    const _callback = (
      result: ISubmittableResult,
      _resolve: (value: boolean | PromiseLike<boolean>) => void
    ) => {
      const { status } = result;

      if (status.isInBlock) {
        _resolve(true);
      }
    };

    const tx = this.api.tx.swaps.swapExactAmountOut(
      this.poolId,
      assetIn,
      maxAmountIn,
      assetOut,
      assetAmountOut,
      maxPrice
    );

    return new Promise(async (resolve) => {
      let unsub;
      if (isExtSigner(signer)) {
        unsub = await tx.signAndSend(
          signer.address,
          { signer: signer.signer },
          (result) => {
            callback
              ? callback(result)
              : _callback(result, resolve);
          }
        );
      } else {
        unsub = await tx.signAndSend(signer, (result) => {
          callback
            ? callback(result)
            : _callback(result, resolve);
        });
      }
      
      setTimeout(() => {
        unsub();
      }, 20000);
    });
  };
}
