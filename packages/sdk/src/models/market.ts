import { ApiPromise } from "@polkadot/api";
import { ISubmittableResult } from "@polkadot/types/types";

import Swap from "./swaps";
import {
  MarketResponse,
  ExtendedMarketResponse,
  FilteredMarketResponse,
  KeyringPairOrExtSigner,
  MarketCreation,
  MarketEnd,
  Report,
  MarketDispute,
  AssetId,
  OutcomeAsset,
  PoolResponse,
} from "../types";
import { NativeShareId } from "../consts";
import { isExtSigner, unsubOrWarns } from "../util";

/**
 * The Market class initializes all the market data.
 */
class Market {
  /** The unique identifier for this market. */
  public marketId: number;
  /** The creator of the market. */
  public creator: string;
  /** The creation type of the market. Can be `Permissionless` or `Advised`. */
  public creation: MarketCreation;
  /** The creator's fee. */
  public creatorFee: number;
  /** The oracle that is designated to report on the market. */
  public oracle: string;
  /** The end block or timestamp for this market. */
  public end: MarketEnd;
  /** The hex-encoded raw metadata for the market. */
  public metadata: string;
  /** The type of market. */
  public marketType: AssetId;
  /** The status of the market. */
  public marketStatus: string;
  /** The reported outcome of the market. Null if the market was not reported yet. */
  public report: Report | null;
  /** The categories of a categorical market. Null if not a categorical market. */
  public categories: number | null;
  /** The resolved outcome for the market. */
  public resolvedOutcome: number | null;
  /** The title of the market. */
  public title: string;
  /** The description of the market. */
  public description: string;
  /** The metadata string. */
  public metadataString: string;
  /** The share identifiers */
  public outcomeAssets: OutcomeAsset[];

  /** Internally hold a reference to the API that created it. */
  private api: ApiPromise;

  constructor(market: ExtendedMarketResponse, api: ApiPromise) {
    const {
      creator,
      creation,
      creator_fee,
      oracle,
      end,
      metadata,
      market_type,
      market_status,
      report,
      categories,
      resolved_outcome,
      marketId,
      title,
      description,
      metadataString,
      outcomeAssets,
    } = market;

    this.creator = creator;
    this.creation = creation as MarketCreation;
    this.creatorFee = creator_fee;
    this.oracle = oracle;
    this.end = end;
    this.metadata = metadata;
    this.marketType = market_type as any;
    this.marketStatus = market_status;
    this.report = report;
    this.categories = categories;
    this.resolvedOutcome = resolved_outcome;
    this.marketId = marketId;
    this.title = title;
    this.description = description;
    this.metadataString = metadataString;
    this.outcomeAssets = outcomeAssets;

    this.api = api;
  }

  toJSONString(): string {
    const market = Object.assign({}, this);
    delete market.api;
    return JSON.stringify(market, null, 2);
  }

  toFilteredJSONString(filter?: string[] | null): string {
    const market = Object.assign({}, this);
    delete market.api;
    if (!filter) {
      return JSON.stringify(market, null, 2);
    } else {
      return JSON.stringify(Market.filterMarketData(market, filter), null, 2);
    }
  }

  static filterMarketData(
    market: ExtendedMarketResponse | MarketResponse | Market,
    filter?: string[] | null
  ): FilteredMarketResponse {
    if (!filter) {
      return market as any;
    }

    const alwaysInclude = ["marketId"];

    const res = {};
    filter
      .concat(alwaysInclude)
      .filter((key) => Object.keys(market).includes(key))
      .forEach((key) => (res[key] = market[key]));
    return res;
  }

  async getEndTimestamp(): Promise<number> {
    if ("timestamp" in this.end) {
      return this.end.timestamp;
    }

    const now = (await this.api.query.timestamp.now()).toNumber();
    const head = await this.api.rpc.chain.getHeader();
    const blockNum = head.number.toNumber();
    const diffInMs = 6000 * (this.end.block - blockNum);
    return now + diffInMs;
  }

  getPoolId = async (): Promise<number | null> => {
    return (
      await this.api.query.predictionMarkets.marketToSwapPool(this.marketId)
    ).toHuman() as number;
  };

  getPool = async (): Promise<Swap> => {
    const poolId = await this.getPoolId();
    if (poolId == null) {
      return null;
    }

    if (poolId == null) {
      return null;
    }

    const poolResponse = (
      await this.api.query.swaps.pools(poolId)
    ).toJSON() as PoolResponse;

    return new Swap(poolId, poolResponse, this.api);
  };

  getDisputes = async (): Promise<MarketDispute[]> => {
    return (
      await this.api.query.predictionMarkets.disputes(this.marketId)
    ).toJSON() as any[];
  };

  deploySwapPool = async (
    signer: KeyringPairOrExtSigner,
    weights: string[],
    callback?: (result: ISubmittableResult, _unsub: () => void) => void
  ): Promise<string> => {
    const poolId = await this.getPoolId();
    if (poolId) {
      throw new Error("Pool already exists for this market.");
    }

    const _callback = (
      result: ISubmittableResult,
      _resolve: (value: string | PromiseLike<string>) => void,
      _unsub: () => void
    ) => {
      const { events, status } = result;
      console.log("status:", status.toHuman());

      if (status.isInBlock) {
        events.forEach(({ phase, event: { data, method, section } }) => {
          console.log(`\t' ${phase}: ${section}.${method}:: ${data}`);

          if (method == "PoolCreate") {
            unsubOrWarns(_unsub);
            _resolve(data[0].toString());
            unsubOrWarns(_unsub);
          }
          if (method == "ExtrinsicFailed") {
            unsubOrWarns(_unsub);
            _resolve("");
            unsubOrWarns(_unsub);
          }
        });
      }
    };

    return new Promise(async (resolve) => {
      // TODO: // sanity check: weights.length should equal outcomes.length+1 (for ZTG)
      // TODO: // weights should each be >= runtime's MinWeight (currently 1e10)
      console.log(
        "Relative weights: ",
        weights
          .map(Number)
          .map((x) => x / 1e10)
          .map((x) => `${x}X1e10`)
      );
      console.log(
        `If market ${this.marketId} has a different number of outcomes than ${
          weights.length - 1
        }, you might get error {6,13}.\n`
      );

      if (this.outcomeAssets) {
        if (weights.length !== this.outcomeAssets.length + 1) {
          console.log(
            "Weights length mismatch. Expect an error {6,13}: ProvidedValuesLenMustEqualAssetsLen."
          );
          if (weights.length === this.outcomeAssets.length) {
            console.log(
              "Hint: don't forget to include the weight of ZTG as the last weight!"
            );
          }
        }
      } else {
        console.log(
          "Market object appears to be a bare MarketResponse, not an ExtendedMarket"
        );
        console.log(
          "This should not happen unless you are running old code for bug testing."
        );
      }

      if (isExtSigner(signer)) {
        const unsub = await this.api.tx.predictionMarkets
          .deploySwapPoolForMarket(this.marketId, weights)
          .signAndSend(signer.address, { signer: signer.signer }, (result) =>
            callback
              ? callback(result, unsub)
              : _callback(result, resolve, unsub)
          );
      } else {
        const unsub = await this.api.tx.predictionMarkets
          .deploySwapPoolForMarket(this.marketId, weights)
          .signAndSend(signer, (result) =>
            callback
              ? callback(result, unsub)
              : _callback(result, resolve, unsub)
          );
      }
    });
  };

  async getAssetsPrices(blockNumber: any): Promise<any> {
    const assetPrices = {};
    const [blockHash, pool] = await Promise.all([
      this.api.rpc.chain.getBlockHash(blockNumber),
      this.getPool(),
    ]);

    if (pool != null) {
      const outAsset = NativeShareId;
      for (const inAsset of pool.assets) {
        if (JSON.stringify(inAsset) != JSON.stringify(outAsset)) {
          try {
            const price = await pool.getSpotPrice(
              inAsset,
              outAsset,
              blockHash.toString()
            );
            assetPrices[JSON.stringify(inAsset)] = price.toString();
          } catch (error) {
            console.log(
              "error fetching and converting pool.getSpotPrice:",
              error
            );
          }
        }
      }
    }
    return assetPrices;
  }

  async buyCompleteSet(
    signer: KeyringPairOrExtSigner,
    amount: number,
    callback?: (result: ISubmittableResult, _unsub: () => void) => void
  ): Promise<boolean> {
    const _callback = (
      result: ISubmittableResult,
      _resolve: (value: boolean | PromiseLike<boolean>) => void,
      _unsub: () => void
    ) => {
      const { status } = result;

      if (status.isInBlock) {
        _resolve(true);
        unsubOrWarns(_unsub);
      }
    };

    return new Promise(async (resolve) => {
      if (isExtSigner(signer)) {
        const unsub = await this.api.tx.predictionMarkets
          .buyCompleteSet(this.marketId, amount)
          .signAndSend(signer.address, { signer: signer.signer }, (result) =>
            callback
              ? callback(result, unsub)
              : _callback(result, resolve, unsub)
          );
      } else {
        const unsub = await this.api.tx.predictionMarkets
          .buyCompleteSet(this.marketId, amount)
          .signAndSend(signer, (result) =>
            callback
              ? callback(result, unsub)
              : _callback(result, resolve, unsub)
          );
      }
    });
  }

  async sellCompleteSet(
    signer: KeyringPairOrExtSigner,
    amount: number,
    callback?: (result: ISubmittableResult, _unsub: () => void) => void
  ): Promise<boolean> {
    const _callback = (
      result: ISubmittableResult,
      _resolve: (value: boolean | PromiseLike<boolean>) => void,
      _unsub: () => void
    ) => {
      const { status } = result;

      if (status.isInBlock) {
        _resolve(true);
        unsubOrWarns(_unsub);
      }
    };

    return new Promise(async (resolve) => {
      if (isExtSigner(signer)) {
        const unsub = await this.api.tx.predictionMarkets
          .sellCompleteSet(this.marketId, amount)
          .signAndSend(signer.address, { signer: signer.signer }, (result) =>
            callback
              ? callback(result, unsub)
              : _callback(result, resolve, unsub)
          );
      } else {
        const unsub = await this.api.tx.predictionMarkets
          .sellCompleteSet(this.marketId, amount)
          .signAndSend(signer, (result) =>
            callback
              ? callback(result, unsub)
              : _callback(result, resolve, unsub)
          );
      }
    });
  }

  async reportOutcome(
    signer: KeyringPairOrExtSigner,
    outcome: number,
    callback?: (result: ISubmittableResult, _unsub: () => void) => void
  ): Promise<string> {
    const _callback = (
      result: ISubmittableResult,
      _resolve: (value: string | PromiseLike<string>) => void,
      _unsub: () => void
    ) => {
      const { events, status } = result;
      console.log("status:", status.toHuman());

      if (status.isInBlock) {
        events.forEach(({ phase, event: { data, method, section } }) => {
          console.log(`\t' ${phase}: ${section}.${method}:: ${data}`);

          if (method == "MarketReported") {
            _resolve(data[0].toString());
          }
          if (method == "ExtrinsicFailed") {
            _resolve("");
          }

          unsubOrWarns(_unsub);
        });
      }
    };

    return new Promise(async (resolve) => {
      if (isExtSigner(signer)) {
        const unsub = await this.api.tx.predictionMarkets
          .report(this.marketId, outcome)
          .signAndSend(signer.address, { signer: signer.signer }, (result) =>
            callback
              ? callback(result, unsub)
              : _callback(result, resolve, unsub)
          );
      } else {
        const unsub = await this.api.tx.predictionMarkets
          .report(this.marketId, outcome)
          .signAndSend(signer, (result) =>
            callback
              ? callback(result, unsub)
              : _callback(result, resolve, unsub)
          );
      }
    });
  }

  async dispute(
    signer: KeyringPairOrExtSigner,
    outcome: number,
    callback?: (result: ISubmittableResult, _unsub: () => void) => void
  ): Promise<string> {
    const _callback = (
      result: ISubmittableResult,
      _resolve: (value: string | PromiseLike<string>) => void,
      _unsub: () => void
    ) => {
      const { events, status } = result;
      console.log("status:", status.toHuman());

      if (status.isInBlock) {
        events.forEach(({ phase, event: { data, method, section } }) => {
          console.log(`\t' ${phase}: ${section}.${method}:: ${data}`);

          if (method == "MarketDisputed") {
            _resolve(data[0].toString());
          }
          if (method == "ExtrinsicFailed") {
            _resolve("");
          }

          unsubOrWarns(_unsub);
        });
      }
    };

    return new Promise(async (resolve) => {
      if (isExtSigner(signer)) {
        const unsub = await this.api.tx.predictionMarkets
          .dispute(this.marketId, outcome)
          .signAndSend(signer.address, { signer: signer.signer }, (result) =>
            callback
              ? callback(result, unsub)
              : _callback(result, resolve, unsub)
          );
      } else {
        const unsub = await this.api.tx.predictionMarkets
          .dispute(this.marketId, outcome)
          .signAndSend(signer, (result) =>
            callback
              ? callback(result, unsub)
              : _callback(result, resolve, unsub)
          );
      }
    });
  }

  async redeemShares(
    signer: KeyringPairOrExtSigner,
    callback?: (result: ISubmittableResult, _unsub: () => void) => void
  ): Promise<boolean> {
    const _callback = (
      result: ISubmittableResult,
      _resolve: (value: boolean | PromiseLike<boolean>) => void,
      _unsub: () => void
    ) => {
      const { status } = result;

      if (status.isInBlock) {
        _resolve(true);
        unsubOrWarns(_unsub);
      }
    };

    return new Promise(async (resolve) => {
      if (isExtSigner(signer)) {
        const unsub = await this.api.tx.predictionMarkets
          .redeemShares(this.marketId)
          .signAndSend(signer.address, { signer: signer.signer }, (result) =>
            callback
              ? callback(result, unsub)
              : _callback(result, resolve, unsub)
          );
      } else {
        const unsub = await this.api.tx.predictionMarkets
          .redeemShares(this.marketId)
          .signAndSend(signer, (result) =>
            callback
              ? callback(result, unsub)
              : _callback(result, resolve, unsub)
          );
      }
    });
  }

  async approve(
    signer: KeyringPairOrExtSigner,
    callback?: (result: ISubmittableResult, _unsub: () => void) => void
  ): Promise<string> {
    const _callback = (
      result: ISubmittableResult,
      _resolve: (value: string | PromiseLike<string>) => void,
      _unsub: () => void
    ) => {
      const { events, status } = result;
      console.log("status:", status.toHuman());

      if (status.isInBlock) {
        events.forEach(({ phase, event: { data, method, section } }) => {
          console.log(`\t' ${phase}: ${section}.${method}:: ${data}`);

          if (method == "MarketApproved") {
            _resolve(data[0].toString());
          }
          if (method == "ExtrinsicFailed") {
            _resolve("");
          }

          unsubOrWarns(_unsub);
        });
      }
    };

    return new Promise(async (resolve) => {
      const call = await this.api.tx.predictionMarkets.approveMarket(
        this.marketId
      );

      const sudoTx = await this.api.tx.sudo.sudo(call);

      if (isExtSigner(signer)) {
        const unsub = await sudoTx.signAndSend(
          signer.address,
          { signer: signer.signer },
          (result) =>
            callback
              ? callback(result, unsub)
              : _callback(result, resolve, unsub)
        );
      } else {
        const unsub = await sudoTx.signAndSend(signer, (result) =>
          callback ? callback(result, unsub) : _callback(result, resolve, unsub)
        );
      }
    });
  }

  async reject(
    signer: KeyringPairOrExtSigner,
    callback?: (result: ISubmittableResult, _unsub: () => void) => void
  ): Promise<string> {
    const _callback = (
      result: ISubmittableResult,
      _resolve: (value: string | PromiseLike<string>) => void,
      _unsub: () => void
    ) => {
      const { events, status } = result;
      console.log("status:", status.toHuman());

      if (status.isInBlock) {
        events.forEach(({ phase, event: { data, method, section } }) => {
          console.log(`\t' ${phase}: ${section}.${method}:: ${data}`);

          if (method == "MarketRejected") {
            _resolve(data[0].toString());
          }
          if (method == "ExtrinsicFailed") {
            _resolve("");
          }

          unsubOrWarns(_unsub);
        });
      }
    };

    return new Promise(async (resolve) => {
      const call = await this.api.tx.predictionMarkets.rejectMarket(
        this.marketId
      );

      const sudoTx = await this.api.tx.sudo.sudo(call);

      if (isExtSigner(signer)) {
        const unsub = await sudoTx.signAndSend(
          signer.address,
          { signer: signer.signer },
          (result) =>
            callback
              ? callback(result, unsub)
              : _callback(result, resolve, unsub)
        );
      } else {
        const unsub = await sudoTx.signAndSend(signer, (result) =>
          callback ? callback(result, unsub) : _callback(result, resolve, unsub)
        );
      }
    });
  }

  async cancelAdvised(
    signer: KeyringPairOrExtSigner,
    callback?: (result: ISubmittableResult, _unsub: () => void) => void
  ): Promise<string> {
    const _callback = (
      result: ISubmittableResult,
      _resolve: (value: string | PromiseLike<string>) => void,
      _unsub: () => void
    ) => {
      const { events, status } = result;
      console.log("status:", status.toHuman());

      if (status.isInBlock) {
        events.forEach(({ phase, event: { data, method, section } }) => {
          console.log(`\t' ${phase}: ${section}.${method}:: ${data}`);

          if (method == "MarketCancelled") {
            _resolve(data[0].toString());
          }
          if (method == "ExtrinsicFailed") {
            _resolve("");
          }

          unsubOrWarns(_unsub);
        });
      }
    };

    return new Promise(async (resolve) => {
      if (isExtSigner(signer)) {
        const unsub = await this.api.tx.predictionMarkets
          .cancelPendingMarket(this.marketId)
          .signAndSend(signer.address, { signer: signer.signer }, (result) =>
            callback
              ? callback(result, unsub)
              : _callback(result, resolve, unsub)
          );
      } else {
        const unsub = await this.api.tx.predictionMarkets
          .cancelPendingMarket(this.marketId)
          .signAndSend(signer, (result) =>
            callback
              ? callback(result, unsub)
              : _callback(result, resolve, unsub)
          );
      }
    });
  }
}

export default Market;
