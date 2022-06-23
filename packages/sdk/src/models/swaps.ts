import { ApiPromise } from "@polkadot/api";
import { ISubmittableResult } from "@polkadot/types/types";
import ErrorTable from "../errorTable";

import { KeyringPairOrExtSigner, AssetId, poolJoinOpts } from "../types";
import {
  AssetIdFromString,
  estimatedFee,
  isExtSigner,
  unsubOrWarns,
} from "../util";
import {
  Asset,
  Pool,
  PoolStatus,
} from "@zeitgeistpm/types/dist/interfaces/index";
import {
  SwapExactAmountInParams,
  SwapExactAmountOutParams,
} from "../types/swaps";

/**
 * The Swap class provides an interface over the `Swaps` module for
 * providing liquidity to pools and swapping assets.
 */
export default class Swap {
  /** The share identifiers */
  public assets: Asset[];
  /** The status of the swap. */
  public status: string;
  /** The fee applied to each swap. */
  public swapFee: string;
  /** The sum of `weights` */
  public totalWeight: string;
  /** The list of lengths for each asset. */
  public weights;
  /** The unique identifier for this pool. */
  public poolId: number;
  /** Internally hold a reference to the API that created it. */
  private api: ApiPromise;
  /** All system & custom errors with documentation. */
  private errorTable: ErrorTable;

  constructor(
    poolId: number,
    details: Pool,
    api: ApiPromise,
    errorTable: ErrorTable
  ) {
    const { assets, poolStatus, swapFee, totalWeight, weights } = details;

    this.assets = assets;
    this.status = poolStatus.toString();
    this.swapFee = swapFee.toString();
    this.totalWeight = totalWeight.toString();
    this.weights = weights;
    this.poolId = poolId;
    this.api = api;
    this.errorTable = errorTable;
  }

  /**
   * Returns this object as a nicely formatted JSON string.
   */
  public toJSONString(): string {
    const swap = Object.assign({}, this);
    delete swap.api;
    delete swap.errorTable;
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
      typeof inAsset === "string" ? AssetIdFromString(inAsset) : inAsset,
      typeof outAsset === "string" ? AssetIdFromString(outAsset) : outAsset,
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

  public async fetchPoolSpotPrices(
    inAsset: string | AssetId,
    outAsset: string | AssetId,
    blockNumbers: number[]
  ): Promise<any> {
    if (blockNumbers) {
      //@ts-ignore
      return this.api.rpc.swaps.getSpotPrices(
        this.poolId,
        AssetIdFromString(inAsset),
        AssetIdFromString(outAsset),
        blockNumbers
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
  //   callbackOrPaymentInfo: (((result: ISubmittableResult, _unsub: () => void) => void) | boolean) = false
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

  /**
   * Joins a given set of assets provided by signer to the pool.
   * @param signer The actual signer provider to sign the transaction.
   * @param poolAmountOut The amount of LP shares for this pool that should be minted to the provider.
   * @param maxAmountsIn List of asset upper bounds. The values are maximum limit for the assets.
   * @param callbackOrPaymentInfo "true" to get txn fee estimation otherwise callback to capture transaction result.
   */
  joinPool = async (
    signer: KeyringPairOrExtSigner,
    poolAmountOut: string,
    maxAmountsIn: string[],
    callbackOrPaymentInfo:
      | ((result: ISubmittableResult, _unsub: () => void) => void)
      | boolean = false
  ): Promise<string | boolean> => {
    const tx = this.api.tx.swaps.poolJoin(
      this.poolId,
      poolAmountOut,
      maxAmountsIn
    );

    if (typeof callbackOrPaymentInfo === "boolean" && callbackOrPaymentInfo) {
      return estimatedFee(tx, signer.address);
    }
    const callback =
      typeof callbackOrPaymentInfo !== "boolean"
        ? callbackOrPaymentInfo
        : undefined;

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

  /**
   * Transfer the exact amount of assets from signer to the pool.
   * @param signer The actual signer provider to sign the transaction.
   * @param assetIn Asset entering the pool.
   * @param assetAmount Asset amount that is entering the pool.
   * @param minPoolAmount The calculated amount for the pool must be equal or greater than the given value.
   * @param callbackOrPaymentInfo "true" to get txn fee estimation otherwise callback to capture transaction result.
   */
  poolJoinWithExactAssetAmount = async (
    signer: KeyringPairOrExtSigner,
    assetIn: any,
    assetAmount: any,
    minPoolAmount: any,
    callbackOrPaymentInfo:
      | ((result: ISubmittableResult, _unsub: () => void) => void)
      | boolean = false
  ): Promise<string | boolean> => {
    // Create the transaction type and supply it with the arguments.
    const tx = this.api.tx.swaps.poolJoinWithExactAssetAmount(
      this.poolId,
      assetIn,
      assetAmount,
      minPoolAmount
    );

    if (typeof callbackOrPaymentInfo === "boolean" && callbackOrPaymentInfo) {
      return estimatedFee(tx, signer.address);
    }
    const callback =
      typeof callbackOrPaymentInfo !== "boolean"
        ? callbackOrPaymentInfo
        : undefined;

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
   * @param signer The actual signer provider to sign the transaction.
   * @param opts To be provided with `asset`, `bounds.assetAmount`, `bounds.poolMin` for MinPool
   * and with `asset`, `bounds.poolAmount`, `bounds.AssetMin` for MaxAsset
   * and with `bounds.poolAmount`, `bounds.AssetMin` for `sdk.models.swaps.joinPool`.
   * @param callbackOrPaymentInfo "true" to get txn fee estimation otherwise callback to capture transaction result.
   */
  joinPoolMultifunc = async (
    signer: KeyringPairOrExtSigner,
    opts: poolJoinOpts,
    callbackOrPaymentInfo:
      | ((result: ISubmittableResult, _unsub: () => void) => void)
      | boolean = false
  ): Promise<string | boolean> => {
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
      if (areAllUndefined("assetId")) {
        throw new Error("Missing assetId.");
      }

      tx = this.api.tx.swaps.poolJoinWithExactAssetAmount(
        this.poolId,
        opts.asset,
        opts.bounds.assetAmount,
        opts.bounds.poolMin
      );
    } else if (isLikeNum("poolAmount") && isLikeNum("assetMax")) {
      // PoolJoinForMaxAsset, with assetId optional
      if (!areAllUndefined("assetAmount", "poolMin", "poolMax", "assetMin")) {
        throw new Error("Too many asset and pool bounds were specified.");
      }
      if (!areAllUndefined("assetId") && Array.isArray(opts.bounds.assetMax)) {
        throw new Error("Too many asset maxima were specified.");
      } else if (
        areAllUndefined("assetId") &&
        !Array.isArray(opts.bounds.assetMax)
      ) {
        opts.bounds.assetMax = [opts.bounds.assetMax];
      }

      tx = areAllUndefined("assetId")
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
        poolId, assetId, bounds = { poolAmount, assetMax } \n
        poolId, bounds = { poolAmount, assetMax } \n
        poolId, bounds = { assetAmount, poolMin } \n`);
    }

    if (typeof callbackOrPaymentInfo === "boolean" && callbackOrPaymentInfo) {
      return estimatedFee(tx, signer.address);
    }
    const callback =
      typeof callbackOrPaymentInfo !== "boolean"
        ? callbackOrPaymentInfo
        : undefined;

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

  /**
   * Retrieves a given set of assets from pool to the signer.
   * @param signer The actual signer provider to sign the transaction.
   * @param poolAmountIn The amount of LP shares of this pool being burned based on the retrieved assets.
   * @param minAmountsOut List of asset lower bounds. The values are minimum limit for the assets.
   * @param callbackOrPaymentInfo "true" to get txn fee estimation otherwise callback to capture transaction result.
   */
  exitPool = async (
    signer: KeyringPairOrExtSigner,
    poolAmountIn: string,
    minAmountsOut: string[],
    callbackOrPaymentInfo:
      | ((result: ISubmittableResult, _unsub: () => void) => void)
      | boolean = false
  ): Promise<string | boolean> => {
    const tx = this.api.tx.swaps.poolExit(
      this.poolId,
      poolAmountIn,
      minAmountsOut
    );

    if (typeof callbackOrPaymentInfo === "boolean" && callbackOrPaymentInfo) {
      return estimatedFee(tx, signer.address);
    }
    const callback =
      typeof callbackOrPaymentInfo !== "boolean"
        ? callbackOrPaymentInfo
        : undefined;

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

  /**
   * Swaps a given `assetAmountIn` of the `assetIn/assetOut` pair to pool.
   * @param {KeyringPairOrExtSigner} params.signer The actual signer provider to sign the transaction.
   * @param {string} params.assetIn Asset entering the pool.
   * @param {string} params.assetAmountIn Amount that will be transferred from the provider to the pool.
   * @param {string} params.assetOut Asset leaving the pool.
   * @param {string} params.minAmountOut Minimum asset amount that can leave the pool.
   * @param {string} params.maxPrice Market price must be equal or less than the provided value.
   * @param {boolean} params.callbackOrPaymentInfo `true` to get txn fee estimation otherwise callback to capture transaction result.
   */
  swapExactAmountIn = async (
    params: SwapExactAmountInParams
  ): Promise<string | boolean> => {
    const {
      signer,
      assetIn,
      assetAmountIn,
      assetOut,
      minAmountOut,
      maxPrice,
      callbackOrPaymentInfo,
    } = params;

    const tx = this.api.tx.swaps.swapExactAmountIn(
      this.poolId,
      AssetIdFromString(assetIn),
      assetAmountIn,
      AssetIdFromString(assetOut),
      minAmountOut,
      maxPrice
    );

    if (typeof callbackOrPaymentInfo === `boolean` && callbackOrPaymentInfo) {
      return estimatedFee(tx, signer.address);
    }
    const callback =
      typeof callbackOrPaymentInfo !== `boolean`
        ? callbackOrPaymentInfo
        : undefined;

    const _callback = (
      result: ISubmittableResult,
      _resolve: (value: boolean | PromiseLike<boolean>) => void,
      _unsub: () => void
    ) => {
      const { events, status } = result;

      if (status.isInBlock) {
        console.log(`Transaction included at blockHash ${status.asInBlock}\n`);

        events.forEach(({ event: { data, method, section } }, index) => {
          console.log(`Event ${index} -> ${section}.${method} :: ${data}`);

          if (method == `SwapExactAmountIn`) {
            console.log(
              `\x1b[36m%s\x1b[0m`,
              `\n${data[0][`assetAmountOut`]} units of ${
                data[0][`assetOut`]
              } credited for selling ${data[0][`assetAmountIn`]} units of ${
                data[0][`assetIn`]
              }\n`
            );
            _resolve(true);
          } else if (method == `ExtrinsicFailed`) {
            const { index, error } = data.toJSON()[0].module;
            try {
              const { errorName, documentation } = this.errorTable.getEntry(
                index,
                parseInt(error.substring(2, 4), 16)
              );
              console.log(
                `\x1b[36m%s\x1b[0m`,
                `\n${errorName}: ${documentation}`
              );
            } catch (err) {
              console.log(err);
            } finally {
              _resolve(false);
            }
          }
          unsubOrWarns(_unsub);
        });
      }
    };

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

  /**
   * Swaps a given `assetAmountOut` of the `assetIn/assetOut` pair to pool.
   * @param {KeyringPairOrExtSigner} params.signer The actual signer provider to sign the transaction.
   * @param {string} params.assetIn Asset entering the pool.
   * @param {string} params.maxAmountIn Maximum asset amount that can enter the pool.
   * @param {string} params.assetOut Asset leaving the pool.
   * @param {string} params.assetAmountOut Amount that will be transferred from the pool to the provider.
   * @param {string} params.maxPrice Market price must be equal or less than the provided value.
   * @param {boolean} params.callbackOrPaymentInfo `true` to get txn fee estimation otherwise callback to capture transaction result.
   */
  swapExactAmountOut = async (
    params: SwapExactAmountOutParams
  ): Promise<string | boolean> => {
    const {
      signer,
      assetIn,
      maxAmountIn,
      assetOut,
      assetAmountOut,
      maxPrice,
      callbackOrPaymentInfo,
    } = params;

    const tx = this.api.tx.swaps.swapExactAmountOut(
      this.poolId,
      AssetIdFromString(assetIn),
      maxAmountIn,
      AssetIdFromString(assetOut),
      assetAmountOut,
      maxPrice
    );

    if (typeof callbackOrPaymentInfo === `boolean` && callbackOrPaymentInfo) {
      return estimatedFee(tx, signer.address);
    }
    const callback =
      typeof callbackOrPaymentInfo !== `boolean`
        ? callbackOrPaymentInfo
        : undefined;

    const _callback = (
      result: ISubmittableResult,
      _resolve: (value: boolean | PromiseLike<boolean>) => void,
      _unsub: () => void
    ) => {
      const { events, status } = result;

      if (status.isInBlock) {
        console.log(`Transaction included at blockHash ${status.asInBlock}\n`);

        events.forEach(({ event: { data, method, section } }, index) => {
          console.log(`Event ${index} -> ${section}.${method} :: ${data}`);

          if (method == `SwapExactAmountOut`) {
            console.log(
              `\x1b[36m%s\x1b[0m`,
              `\n${data[0][`assetAmountIn`]} units of ${
                data[0][`assetIn`]
              } used for buying ${data[0][`assetAmountOut`]} units of ${
                data[0][`assetOut`]
              }\n`
            );
            _resolve(true);
          } else if (method == `ExtrinsicFailed`) {
            const { index, error } = data.toJSON()[0].module;
            try {
              const { errorName, documentation } = this.errorTable.getEntry(
                index,
                parseInt(error.substring(2, 4), 16)
              );
              console.log(
                `\x1b[36m%s\x1b[0m`,
                `\n${errorName}: ${documentation}`
              );
            } catch (err) {
              console.log(err);
            } finally {
              _resolve(false);
            }
          }
          unsubOrWarns(_unsub);
        });
      }
    };

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
