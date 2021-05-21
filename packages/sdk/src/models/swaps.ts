import { ApiPromise } from "@polkadot/api";
import { ISubmittableResult } from "@polkadot/types/types";

import { KeyringPairOrExtSigner, AssetShortform, poolJoinOpts } from "../types";
import { AssetTypeFromString, isExtSigner, unsubOrWarns } from "../util";
import { Asset, Pool } from "@zeitgeistpm/types/dist/interfaces/index";
// import { util } from "..";

/**
 * The Swap class provides an interface over the `Swaps` module for
 * providing liquidity to pools and swapping assets.
 */
export default class Swap {
  public assets: Asset[];
  public swapFee: string;
  public totalWeight: string;
  public weights;
  public poolId: number;

  /** Internally hold a reference to the API that created it. */
  private api: ApiPromise;

  constructor(poolId: number, details: Pool, api: ApiPromise) {
    const { assets, swap_fee, total_weight, weights } = details;

    this.assets = assets;
    this.swapFee = swap_fee.toString();
    this.totalWeight = total_weight.toString();
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

  public async getSpotPrice(
    inAsset: string | Asset,
    outAsset: string | Asset,
    blockHash?: any
  ): Promise<any> {
    if (!blockHash) {
      blockHash = await this.api.rpc.chain.getBlockHash();
    }

    //@ts-ignore
    return this.api.rpc.swaps.getSpotPrice(
      this.poolId,
      typeof inAsset === "string" ? AssetTypeFromString(inAsset) : inAsset,
      typeof outAsset === "string" ? AssetTypeFromString(outAsset) : outAsset,
      blockHash
    );
  }

  public async assetSpotPricesInZtg(
    blockHash?: any
  ): Promise<{ [key: string]: string }> {
    const prices = {};
    for (const asset of this.assets) {
      if (asset.isZtg) {
        continue;
      }
      //@ts-ignore
      const price = await this.getSpotPrice({ ztg: null }, asset, blockHash);
      prices[asset.toString()] = price.toString();
    }

    return prices;
  }

  public async fetchPoolSpotPricesFromBlockNumbersForgiving(
    inAsset: string | Asset | AssetShortform,
    outAsset: string | Asset | AssetShortform,
    blockNumbers: number[]
  ): Promise<any> {
    return this.fetchPoolSpotPricesFromBlockNumbers(
      AssetTypeFromString(inAsset),
      AssetTypeFromString(outAsset),
      blockNumbers
    );
  }

  public async fetchPoolSpotPricesFromBlockNumbers(
    inAsset: Asset,
    outAsset: Asset,
    blockNumbers: number[]
  ): Promise<any> {
    const timer = Date.now();
    const blockHashes = await Promise.all(
      blockNumbers.map((block) =>
        this.api.rpc.chain.getBlockHash(block).then((hash) => hash.toString())
      )
    );

    return this.fetchPoolSpotPrices(inAsset, outAsset, blockHashes);
  }

  public async fetchPoolSpotPricesForgiving(
    inAsset: string | Asset | AssetShortform,
    outAsset: string | Asset | AssetShortform,
    blockHashes: string[]
  ): Promise<any> {
    return this.fetchPoolSpotPrices(
      AssetTypeFromString(inAsset),
      AssetTypeFromString(outAsset),
      blockHashes
    );
  }

  public async fetchPoolSpotPrices(
    inAsset: Asset,
    outAsset: Asset,
    blockHashes: string[]
  ): Promise<any> {
    if (blockHashes) {
      //@ts-ignore
      return this.api.rpc.swaps.getSpotPrices(
        this.poolId,
        inAsset,
        outAsset,
        blockHashes
      );
    }
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

  // /// Unimplemented:
  // /// Comment in (exposed) substrate pub fn create_pool:
  // ///   Temporary probably - The Swap is created per prediction market.
  // /// Instead of this function, use Market.deploySwapPool
  // createPool = async (
  //   signer: KeyringPairOrExtSigner,
  //   assets: string[],
  //   weights?: string[],
  //   callback?: (result: ISubmittableResult, _unsub: () => void) => void
  // ): Promise<string> => {
  //     if (assets.length !== weights.length) {
  //       throw new Error("Relative weights were supplied, but they do not cover all assets.");
  //     }
  //     if (!weights) {
  //       weights = new Array(assets.length).fill(1);
  //     }
  //     ...
  //     return new Promise(async (resolve) => {
  //         const unsub = await this.api.tx.swaps
  //           .createPool(this.marketId, assets, weights)
  //           . etc etc
  //     });
  // };

  joinPool = async (
    signer: KeyringPairOrExtSigner,
    poolAmountOut: string,
    maxAmountsIn: string[],
    callback?: (result: ISubmittableResult, _unsub: () => void) => void
  ): Promise<boolean> => {
    const _callback = (
      result: ISubmittableResult,
      _resolve: (value: boolean | PromiseLike<boolean>) => void,
      _unsub: () => void
    ) => {
      const { events, status } = result;

      if (status.isInBlock) {
        events.forEach(({ phase, event: { data, method, section } }) => {
          console.log(`\t' ${phase}: ${section}.${method}:: ${data}`);

          if (method == "ExtrinsicSuccess") {
            unsubOrWarns(_unsub);
            _resolve(true);
          }
          if (method == "ExtrinsicFailed") {
            unsubOrWarns(_unsub);
            _resolve(false);
          }
        });
      }
    };

    const tx = this.api.tx.swaps.poolJoin(
      this.poolId,
      poolAmountOut,
      maxAmountsIn
    );

    return new Promise(async (resolve) => {
      if (isExtSigner(signer)) {
        const unsub = await tx.signAndSend(
          signer.address,
          { signer: signer.signer },
          (result) => {
            callback
              ? callback(result, unsub)
              : _callback(result, resolve, unsub);
          }
        );
      } else {
        const unsub = await tx.signAndSend(signer, (result) => {
          callback
            ? callback(result, unsub)
            : _callback(result, resolve, unsub);
        });
      }
    });
  };

  poolJoinWithExactAssetAmountForgiving = async (
    signer: KeyringPairOrExtSigner,
    assetIn: Asset | AssetShortform | string,
    assetAmount: number,
    minPoolAmount: number,
    callback?: (result: ISubmittableResult, _unsub: () => void) => void
  ): Promise<boolean> => {
    return this.poolJoinWithExactAssetAmount(
      signer,
      AssetTypeFromString(assetIn),
      assetAmount,
      minPoolAmount,
      callback
    );
  };

  poolJoinWithExactAssetAmount = async (
    signer: KeyringPairOrExtSigner,
    assetIn: Asset,
    assetAmount: number,
    minPoolAmount: number,
    callback?: (result: ISubmittableResult, _unsub: () => void) => void
  ): Promise<boolean> => {
    // Define the default callback if none is provided by the invoker of this function.
    const _callback = (
      result: ISubmittableResult,
      _resolve: (value: boolean | PromiseLike<boolean>) => void,
      _unsub: () => void
    ) => {
      const { events, status } = result;

      if (status.isInBlock) {
        events.forEach(({ phase, event: { data, method, section } }) => {
          console.log(`\t' ${phase}: ${section}.${method}:: ${data}`);

          if (method == "ExtrinsicSuccess") {
            unsubOrWarns(_unsub);
            _resolve(true);
          }
          if (method == "ExtrinsicFailed") {
            unsubOrWarns(_unsub);
            _resolve(false);
          }
        });
      }
    };

    // Create the transaction type and supply it with the arguments.
    const tx = this.api.tx.swaps.poolJoinWithExactAssetAmount(
      this.poolId,
      assetIn,
      assetAmount,
      minPoolAmount
    );

    return new Promise(async (resolve) => {
      if (isExtSigner(signer)) {
        const unsub = await tx.signAndSend(
          signer.address,
          { signer: signer.signer },
          (result) => {
            callback
              ? callback(result, unsub)
              : _callback(result, resolve, unsub);
          }
        );
      } else {
        const unsub = await tx.signAndSend(signer, (result) => {
          callback
            ? callback(result, unsub)
            : _callback(result, resolve, unsub);
        });
      }
    });
  };

  poolJoinWithExactPoolAmountForgiving = async (
    signer: KeyringPairOrExtSigner,
    assetIn: Asset | AssetShortform | string,
    PoolAmount: number,
    maxAssetAmount: number,
    callback?: (result: ISubmittableResult, _unsub: () => void) => void
  ): Promise<boolean> => {
    return this.poolJoinWithExactPoolAmount(
      signer,
      AssetTypeFromString(assetIn),
      PoolAmount,
      maxAssetAmount,
      callback
    );
  };

  poolJoinWithExactPoolAmount = async (
    signer: KeyringPairOrExtSigner,
    assetIn: Asset,
    PoolAmount: number,
    maxAssetAmount: number,
    callback?: (result: ISubmittableResult, _unsub: () => void) => void
  ): Promise<boolean> => {
    // Define the default callback if none is provided by the invoker of this function.
    const _callback = (
      result: ISubmittableResult,
      _resolve: (value: boolean | PromiseLike<boolean>) => void,
      _unsub: () => void
    ) => {
      const { events, status } = result;

      if (status.isInBlock) {
        events.forEach(({ phase, event: { data, method, section } }) => {
          console.log(`\t' ${phase}: ${section}.${method}:: ${data}`);

          if (method == "ExtrinsicSuccess") {
            unsubOrWarns(_unsub);
            _resolve(true);
          }
          if (method == "ExtrinsicFailed") {
            unsubOrWarns(_unsub);
            _resolve(false);
          }
        });
      }
    };

    // Create the transaction type and supply it with the arguments.
    const tx = this.api.tx.swaps.poolJoinWithExactAssetAmount(
      this.poolId,
      assetIn,
      PoolAmount,
      maxAssetAmount
    );

    return new Promise(async (resolve) => {
      if (isExtSigner(signer)) {
        const unsub = await tx.signAndSend(
          signer.address,
          { signer: signer.signer },
          (result) => {
            callback
              ? callback(result, unsub)
              : _callback(result, resolve, unsub);
          }
        );
      } else {
        const unsub = await tx.signAndSend(signer, (result) => {
          callback
            ? callback(result, unsub)
            : _callback(result, resolve, unsub);
        });
      }
    });
  };

  /** Three substrate join_pool_xxx functions in one
   *  param types are forgiving
   */
  joinPoolMultifunc = async (
    signer: KeyringPairOrExtSigner,
    opts: poolJoinOpts,
    callback?: (result: ISubmittableResult, _unsub: () => void) => void
  ): Promise<boolean> => {
    const _callback = (
      result: ISubmittableResult,
      _resolve: (value: boolean | PromiseLike<boolean>) => void,
      _unsub: () => void
    ) => {
      const { events, status } = result;
      console.log("status:", status.toHuman());

      if (status.isInBlock) {
        events.forEach(({ phase, event: { data, method, section } }) => {
          console.log(`\t' ${phase}: ${section}.${method}:: ${data}`);

          if (method == "ExtrinsicSuccess") {
            unsubOrWarns(_unsub);
            _resolve(true);
          }
          if (method == "ExtrinsicFailed") {
            unsubOrWarns(_unsub);
            _resolve(false);
          }
        });
      }
    };
    /// Quick helpers for readability
    const isLikeNum = (param) => {
      const p = opts.bounds[param];
      return (
        typeof p === "number" || (Array.isArray(p) && typeof p[0] === "number")
      );
    };
    const areAllUndefined = (...params) =>
      params.every((param) => typeof opts.bounds[param] === "undefined");
    let tx;

    if (isLikeNum("assetAmount") && isLikeNum("poolMin")) {
      // PoolJoinForMinPool
      if (!areAllUndefined("poolAmount", "poolMax", "assetMin", "assetMax")) {
        throw new Error("Too many asset and pool bounds were specified.");
      }
      if (areAllUndefined("asset")) {
        throw new Error("Missing parameter: asset");
      }

      tx = this.api.tx.swaps.poolJoinWithExactAssetAmount(
        this.poolId,
        opts.asset,
        opts.bounds.assetAmount,
        opts.bounds.poolMin
      );
    } else if (isLikeNum("poolAmount") && isLikeNum("assetMax")) {
      // PoolJoinForMaxAsset, with asset optional
      if (!areAllUndefined("assetAmount", "poolMin", "poolMax", "assetMin")) {
        throw new Error("Too many asset and pool bounds were specified.");
      }
      if (!areAllUndefined("asset") && Array.isArray(opts.bounds.assetMax)) {
        throw new Error("Too many asset maxima were specified.");
      } else if (
        areAllUndefined("asset") &&
        !Array.isArray(opts.bounds.assetMax)
      ) {
        opts.bounds.assetMax = [opts.bounds.assetMax];
      }

      tx = areAllUndefined("asset")
        ? this.api.tx.swaps.poolJoin(
            this.poolId,
            opts.bounds.poolAmount,
            opts.bounds.assetMax
          )
        : this.api.tx.swaps.poolJoinWithExactPoolAmount(
            this.poolId,
            opts.asset,
            opts.bounds.poolAmount,
            opts.bounds.assetMax
          );
    } else {
      console.log(opts.bounds);
      throw new Error(`Incorrect asset and pool bounds in params to joinPool. Valid combinations are:\n
        poolId, asset, bounds = { poolAmount, assetMax } \n
        poolId, bounds = { poolAmount, assetMax } \n
        poolId, bounds = { assetAmount, poolMin } \n`);
    }

    return new Promise(async (resolve) => {
      if (isExtSigner(signer)) {
        const unsub = await tx.signAndSend(
          signer.address,
          { signer: signer.signer },
          (result) => {
            callback
              ? callback(result, unsub)
              : _callback(result, resolve, unsub);
          }
        );
      } else {
        const unsub = await tx.signAndSend(signer, (result) => {
          callback
            ? callback(result, unsub)
            : _callback(result, resolve, unsub);
        });
      }
    });
  };

  exitPool = async (
    signer: KeyringPairOrExtSigner,
    poolAmountIn: number,
    minAmountsOut: number[],
    callback?: (result: ISubmittableResult, _unsub: () => void) => void
  ): Promise<boolean> => {
    const _callback = (
      result: ISubmittableResult,
      _resolve: (value: boolean | PromiseLike<boolean>) => void,
      _unsub: () => void
    ) => {
      const { events, status } = result;
      console.log("status:", status.toHuman());

      if (status.isInBlock) {
        events.forEach(({ phase, event: { data, method, section } }) => {
          console.log(`\t' ${phase}: ${section}.${method}:: ${data}`);

          if (method == "ExtrinsicSuccess") {
            unsubOrWarns(_unsub);
            _resolve(true);
          }
          if (method == "ExtrinsicFailed") {
            unsubOrWarns(_unsub);
            _resolve(false);
          }
        });
      }
    };

    const tx = this.api.tx.swaps.poolExit(
      this.poolId,
      poolAmountIn,
      minAmountsOut
    );

    return new Promise(async (resolve) => {
      if (isExtSigner(signer)) {
        const unsub = await tx.signAndSend(
          signer.address,
          { signer: signer.signer },
          (result) => {
            callback
              ? callback(result, unsub)
              : _callback(result, resolve, unsub);
          }
        );
      } else {
        const unsub = await tx.signAndSend(signer, (result) => {
          callback
            ? callback(result, unsub)
            : _callback(result, resolve, unsub);
        });
      }
    });
  };

  poolExitWithExactAssetAmountForgiving = async (
    signer: KeyringPairOrExtSigner,
    assetOut: Asset | AssetShortform | string,
    assetAmount: number,
    maxPoolAmount: number,
    callback?: (result: ISubmittableResult, _unsub: () => void) => void
  ): Promise<boolean> => {
    return this.poolExitWithExactAssetAmount(
      signer,
      AssetTypeFromString(assetOut),
      assetAmount,
      maxPoolAmount,
      callback
    );
  };

  poolExitWithExactAssetAmount = async (
    signer: KeyringPairOrExtSigner,
    assetOut: Asset,
    assetAmount: number,
    maxPoolAmount: number,
    callback?: (result: ISubmittableResult, _unsub: () => void) => void
  ): Promise<boolean> => {
    // Define the default callback if none is provided by the invoker of this function.
    const _callback = (
      result: ISubmittableResult,
      _resolve: (value: boolean | PromiseLike<boolean>) => void,
      _unsub: () => void
    ) => {
      const { events, status } = result;

      if (status.isInBlock) {
        events.forEach(({ phase, event: { data, method, section } }) => {
          console.log(`\t' ${phase}: ${section}.${method}:: ${data}`);

          if (method == "ExtrinsicSuccess") {
            unsubOrWarns(_unsub);
            _resolve(true);
          }
          if (method == "ExtrinsicFailed") {
            unsubOrWarns(_unsub);
            _resolve(false);
          }
        });
      }
    };

    // Create the transaction type and supply it with the arguments.
    const tx = this.api.tx.swaps.poolExitWithExactAssetAmount(
      this.poolId,
      assetOut,
      assetAmount,
      maxPoolAmount
    );

    return new Promise(async (resolve) => {
      if (isExtSigner(signer)) {
        const unsub = await tx.signAndSend(
          signer.address,
          { signer: signer.signer },
          (result) => {
            callback
              ? callback(result, unsub)
              : _callback(result, resolve, unsub);
          }
        );
      } else {
        const unsub = await tx.signAndSend(signer, (result) => {
          callback
            ? callback(result, unsub)
            : _callback(result, resolve, unsub);
        });
      }
    });
  };

  poolExitWithExactPoolAmountForgiving = async (
    signer: KeyringPairOrExtSigner,
    assetOut: Asset | AssetShortform | string,
    PoolAmount: number,
    minAssetAmount: number,
    callback?: (result: ISubmittableResult, _unsub: () => void) => void
  ): Promise<boolean> => {
    return this.poolExitWithExactPoolAmount(
      signer,
      AssetTypeFromString(assetOut),
      PoolAmount,
      minAssetAmount,
      callback
    );
  };

  poolExitWithExactPoolAmount = async (
    signer: KeyringPairOrExtSigner,
    assetOut: Asset,
    PoolAmount: number,
    minAssetAmount: number,
    callback?: (result: ISubmittableResult, _unsub: () => void) => void
  ): Promise<boolean> => {
    // Define the default callback if none is provided by the invoker of this function.
    const _callback = (
      result: ISubmittableResult,
      _resolve: (value: boolean | PromiseLike<boolean>) => void,
      _unsub: () => void
    ) => {
      const { events, status } = result;

      if (status.isInBlock) {
        events.forEach(({ phase, event: { data, method, section } }) => {
          console.log(`\t' ${phase}: ${section}.${method}:: ${data}`);

          if (method == "ExtrinsicSuccess") {
            unsubOrWarns(_unsub);
            _resolve(true);
          }
          if (method == "ExtrinsicFailed") {
            unsubOrWarns(_unsub);
            _resolve(false);
          }
        });
      }
    };

    // Create the transaction type and supply it with the arguments.
    const tx = this.api.tx.swaps.poolExitWithExactAssetAmount(
      this.poolId,
      assetOut,
      PoolAmount,
      minAssetAmount
    );

    return new Promise(async (resolve) => {
      if (isExtSigner(signer)) {
        const unsub = await tx.signAndSend(
          signer.address,
          { signer: signer.signer },
          (result) => {
            callback
              ? callback(result, unsub)
              : _callback(result, resolve, unsub);
          }
        );
      } else {
        const unsub = await tx.signAndSend(signer, (result) => {
          callback
            ? callback(result, unsub)
            : _callback(result, resolve, unsub);
        });
      }
    });
  };

  swapExactAmountInForgiving = async (
    signer: KeyringPairOrExtSigner,
    assetIn: Asset | AssetShortform | string,
    assetAmountIn: number,
    assetOut: Asset | AssetShortform | string,
    minAmountOut: number,
    maxPrice: number,
    callback?: (result: ISubmittableResult, _unsub: () => void) => void
  ): Promise<boolean> => {
    return this.swapExactAmountIn(
      signer,
      AssetTypeFromString(assetIn),
      assetAmountIn,
      AssetTypeFromString(assetOut),
      minAmountOut,
      maxPrice,
      callback
    );
  };

  swapExactAmountIn = async (
    signer: KeyringPairOrExtSigner,
    assetIn: Asset,
    assetAmountIn: number,
    assetOut: Asset,
    minAmountOut: number,
    maxPrice: number,
    callback?: (result: ISubmittableResult, _unsub: () => void) => void
  ): Promise<boolean> => {
    const _callback = (
      result: ISubmittableResult,
      _resolve: (value: boolean | PromiseLike<boolean>) => void,
      _unsub: () => void
    ) => {
      const { events, status } = result;
      console.log("status:", status.toHuman());

      if (status.isInBlock) {
        events.forEach(({ phase, event: { data, method, section } }) => {
          console.log(`\t' ${phase}: ${section}.${method}:: ${data}`);

          if (method == "ExtrinsicSuccess") {
            unsubOrWarns(_unsub);
            _resolve(true);
          }
          if (method == "ExtrinsicFailed") {
            unsubOrWarns(_unsub);
            _resolve(false);
          }
        });
      }
    };

    const tx = this.api.tx.swaps.swapExactAmountIn(
      this.poolId,
      AssetTypeFromString(assetIn),
      assetAmountIn,
      AssetTypeFromString(assetOut),
      minAmountOut,
      maxPrice
    );

    return new Promise(async (resolve) => {
      if (isExtSigner(signer)) {
        const unsub = await tx.signAndSend(
          signer.address,
          { signer: signer.signer },
          (result) => {
            callback
              ? callback(result, unsub)
              : _callback(result, resolve, unsub);
          }
        );
      } else {
        const unsub = await tx.signAndSend(signer, (result) => {
          callback
            ? callback(result, unsub)
            : _callback(result, resolve, unsub);
        });
      }
    });
  };

  swapExactAmountOutForgiving = async (
    signer: KeyringPairOrExtSigner,
    assetIn: Asset | AssetShortform | string,
    maxAmountIn: number,
    assetOut: Asset | AssetShortform | string,
    assetAmountOut: number,
    maxPrice: number,
    callback?: (result: ISubmittableResult, _unsub: () => void) => void
  ): Promise<boolean> => {
    return this.swapExactAmountOut(
      signer,
      AssetTypeFromString(assetIn),
      maxAmountIn,
      AssetTypeFromString(assetOut),
      assetAmountOut,
      maxPrice,
      callback
    );
  };

  swapExactAmountOut = async (
    signer: KeyringPairOrExtSigner,
    assetIn: Asset,
    maxAmountIn: number,
    assetOut: Asset,
    assetAmountOut: number,
    maxPrice: number,
    callback?: (result: ISubmittableResult, _unsub: () => void) => void
  ): Promise<boolean> => {
    const _callback = (
      result: ISubmittableResult,
      _resolve: (value: boolean | PromiseLike<boolean>) => void,
      _unsub: () => void
    ) => {
      const { events, status } = result;
      console.log("status:", status.toHuman());

      if (status.isInBlock) {
        events.forEach(({ phase, event: { data, method, section } }) => {
          console.log(`\t' ${phase}: ${section}.${method}:: ${data}`);

          if (method == "ExtrinsicSuccess") {
            unsubOrWarns(_unsub);
            _resolve(true);
          }
          if (method == "ExtrinsicFailed") {
            unsubOrWarns(_unsub);
            _resolve(false);
          }
        });
      }
    };

    const tx = this.api.tx.swaps.swapExactAmountOut(
      this.poolId,
      AssetTypeFromString(assetIn),
      maxAmountIn,
      AssetTypeFromString(assetOut),
      assetAmountOut,
      maxPrice
    );

    return new Promise(async (resolve) => {
      if (isExtSigner(signer)) {
        const unsub = await tx.signAndSend(
          signer.address,
          { signer: signer.signer },
          (result) => {
            callback
              ? callback(result, unsub)
              : _callback(result, resolve, unsub);
          }
        );
      } else {
        const unsub = await tx.signAndSend(signer, (result) => {
          callback
            ? callback(result, unsub)
            : _callback(result, resolve, unsub);
        });
      }
    });
  };
}
