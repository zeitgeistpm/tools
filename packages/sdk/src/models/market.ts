import { ApiPromise } from "@polkadot/api";
import { ISubmittableResult } from "@polkadot/types/types";

import Swap from "./swaps";
import {
  MarketResponse,
  ExtendedMarketResponse,
  FilteredMarketResponse,
  KeyringPairOrExtSigner,
  MarketCreation,
  MarketPeriod,
  Report,
  MarketDispute,
  DecodedMarketMetadata,
  CategoryMetadata,
  OutcomeReport,
  ScoringRule,
  MarketDisputeMechanism,
} from "../types";
import { estimatedFee, isExtSigner, unsubOrWarns } from "../util";
import { Asset, MarketType, Pool } from "@zeitgeistpm/types/dist/interfaces";
import { Option } from "@polkadot/types";

/**
 * The Market class initializes all the market data.
 */
class Market {
  /** The short name for the market, ex. 'TEAM 1 v.s TEAM 2'. */
  public slug: string;
  /** The creator of the market. */
  public creator: string;
  /** The creation type of the market. Can be `Permissionless` or `Advised`. */
  public creation: MarketCreation;
  /** The creator's fee. */
  public creatorFee: number;
  /** The oracle that is designated to report on the market. */
  public oracle: string;
  /** The period block or timestamp for this market. */
  public period: MarketPeriod;
  /** The scoring rule used for the market. */
  public scoringRule: ScoringRule;
  /** The type of market. */
  public marketType: MarketType;
  /** The status of the market. */
  public status: string;
  /** The reported outcome of the market. Null if the market was not reported yet. */
  public report: Report | null;
  /** The categories of a categorical market. Null if not a categorical market. */
  public categories: CategoryMetadata[] | null;
  /** The resolved outcome for the market. */
  public resolvedOutcome: OutcomeReport | null;

  /** Timestamp at which market should end */
  public end: BigInt;

  public mdm: MarketDisputeMechanism;
  /** The description of the market. */
  public description: string;
  /** The market question. */
  public question: string;
  /** The share identifiers */
  public outcomeAssets: Asset[];
  /** Market tags */
  public tags: string[];

  public confidential_id?: string;

  /** The image for the market. */
  img?: string;

  /** Liquidty pool id. */
  poolId?: number;

  /** Internally hold a reference to the API that created it. */
  private api: ApiPromise;

  constructor(
    /** The unique identifier for this market. */
    public marketId: number,
    market: MarketResponse,
    decodedMetadata: DecodedMarketMetadata,
    api: ApiPromise
  ) {
    ({
      creator: this.creator,
      creation: this.creation,
      creator_fee: this.creatorFee,
      oracle: this.oracle,
      period: this.period,
      scoring_rule: this.scoringRule,
      market_type: this.marketType,
      status: this.status,
      report: this.report,
      resolved_outcome: this.resolvedOutcome,
      mdm: this.mdm,
      outcomeAssets: this.outcomeAssets,
      end: this.end,
    } = market);

    ({
      slug: this.slug,
      question: this.question,
      description: this.description,
      categories: this.categories,
      tags: this.tags,
      confidential_id: this.confidential_id,
      img: this.img,
    } = decodedMetadata);

    this.api = api;
  }

  /**
   * Converts market object into string.
   */
  toJSONString(): string {
    const market = Object.assign({}, this);
    delete market.api;
    return JSON.stringify(market, null, 2);
  }

  /**
   * Converts market object into string with filters.
   * @param filter The only attributes you want to fetch from the market data.
   */
  toFilteredJSONString(filter?: string[] | null): string {
    const market = Object.assign({}, this);
    delete market.api;
    if (!filter) {
      // Acts like toJSONString() in absence of filter.
      return JSON.stringify(market, null, 2);
    } else {
      return JSON.stringify(Market.filterMarketData(market, filter), null, 2);
    }
  }

  /**
   * Populate only selected attributes from the market data defined using filter.
   * @param market The market data.
   * @param filter The only attributes you want to populate from this market.
   */
  static filterMarketData(
    market: ExtendedMarketResponse | MarketResponse | Market,
    filter?: string[] | null
  ): FilteredMarketResponse {
    if (!filter) {
      // Sends back the received market data in absence of filter.
      return market as any;
    }

    // Populates `marketId` by default.
    const alwaysInclude = ["marketId"];

    const res = {};
    filter
      .concat(alwaysInclude)
      .filter((key) => Object.keys(market).includes(key))
      .forEach((key) => (res[key] = market[key]));
    return res;
  }

  /**
   * Get timestamp at the end of the market period.
   */
  async getEndTimestamp(): Promise<number> {
    if ("timestamp" in this.period) {
      return this.period.timestamp[1];
    }

    const now = (await this.api.query.timestamp.now()).toNumber();
    const head = await this.api.rpc.chain.getHeader();
    const blockNum = head.number.toNumber();
    const diffInMs =
      this.api.consts.timestamp.minimumPeriod.toNumber() *
      (this.period.block[1] - blockNum);
    return now + diffInMs;
  }

  /**
   * Get pool id to be used for fetching data using `sdk.models.market.getPool()`.
   * Returns null if no swap pool is available for the market
   */
  getPoolId = async (): Promise<number | null> => {
    if (this.poolId) {
      return this.poolId;
    }
    return (
      await this.api.query.marketCommons.marketPool(this.marketId)
    ).toHuman() as number;
  };

  /**
   * Recreate swap pool for this market using data fetched with `poolId`.
   */
  getPool = async (): Promise<Swap | null> => {
    const poolId = await this.getPoolId();
    if (poolId == null) {
      return null;
    }

    if (poolId == null) {
      return null;
    }

    const pool = (await this.api.query.swaps.pools(poolId)) as Option<Pool>;

    if (pool.isSome) {
      return new Swap(poolId, pool.unwrap(), this.api);
    }
    return null;
  };

  /**
   * Fetch disputes for this market using unique identifier `marketId`.
   */
  getDisputes = async (): Promise<MarketDispute[]> => {
    return (
      await this.api.query.predictionMarkets.disputes(this.marketId)
    ).toJSON() as any[];
  };

  /**
   * Creates swap pool for this market via `api.tx.predictionMarkets.deploySwapPoolForMarket(marketId, weights)`.
   * @param signer The actual signer provider to sign the transaction.
   * @param weights List of lengths for each asset.
   * @param callbackOrPaymentInfo "true" to get txn fee estimation otherwise callback to capture transaction result.
   * @throws Error if swap pool already exists for the market.
   */
  deploySwapPool = async (
    signer: KeyringPairOrExtSigner,
    weights: string[],
    callbackOrPaymentInfo:
      | ((result: ISubmittableResult, _unsub: () => void) => void)
      | boolean = false
  ): Promise<string> => {
    const poolId = await this.getPoolId();
    if (poolId) {
      throw new Error("Pool already exists for this market.");
    }

    const tx = this.api.tx.predictionMarkets.deploySwapPoolForMarket(
      this.marketId,
      weights
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
          }
          if (method == "ExtrinsicFailed") {
            unsubOrWarns(_unsub);
            _resolve("");
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
        const unsub = await tx.signAndSend(
          signer.address,
          { signer: signer.signer },
          (result) =>
            callback
              ? callback(result, unsub)
              : _callback(result, resolve, unsub)
        );
      } else {
        const unsub = await tx.signAndSend(signer, (result) =>
          callback ? callback(result, unsub) : _callback(result, resolve, unsub)
        );
      }
    });
  };

  /**
   * Fetch spot prices of all assets in this market
   * Can be used to find prices at a particular block using unique identifier.
   * @param blockHash The unique identifier for the block to fetch asset spot prices.
   */
  async assetSpotPricesInZtg(
    blockHash?: any
  ): Promise<{ [key: string]: string }> {
    const pool = await this.getPool();
    if (!pool) {
      return null;
      // throw new Error(
      //   `No swap pool is deployed for market with id: ${this.marketId}`
      // );
    }

    return pool.assetSpotPricesInZtg(blockHash);
  }

  /**
   * Buys a complete set of outcome shares for the market.
   * Note: This is the only way to create new shares.
   * @param signer The actual signer provider to sign the transaction.
   * @param amount The amount of each share.
   * @param callbackOrPaymentInfo "true" to get txn fee estimation otherwise callback to capture transaction result.
   */
  async buyCompleteSet(
    signer: KeyringPairOrExtSigner,
    amount: number,
    callbackOrPaymentInfo:
      | ((result: ISubmittableResult, _unsub: () => void) => void)
      | boolean = false
  ): Promise<string> {
    const tx = this.api.tx.predictionMarkets.buyCompleteSet(
      this.marketId,
      amount
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
      _resolve: (value: string | PromiseLike<string>) => void,
      _unsub: () => void
    ) => {
      const { events, status } = result;
      console.log("status:", status.toHuman());

      if (status.isInBlock) {
        events.forEach(({ phase, event: { data, method, section } }) => {
          console.log(`\t' ${phase}: ${section}.${method}:: ${data}`);

          if (method == "BoughtCompleteSet") {
            _resolve(data[0].toString());
          }
          if (method == "ExtrinsicFailed") {
            _resolve("");
          }
        });
      }
    };

    return new Promise(async (resolve) => {
      if (isExtSigner(signer)) {
        const unsub = await tx.signAndSend(
          signer.address,
          { signer: signer.signer },
          (result) =>
            callback
              ? callback(result, unsub)
              : _callback(result, resolve, unsub)
        );
      } else {
        const unsub = await tx.signAndSend(signer, (result) =>
          callback ? callback(result, unsub) : _callback(result, resolve, unsub)
        );
      }
    });
  }

  /**
   * Sells/Destroys a complete set of outcome shares for the market.
   * @param signer The actual signer provider to sign the transaction.
   * @param amount The amount of each share.
   * @param callbackOrPaymentInfo "true" to get txn fee estimation otherwise callback to capture transaction result.
   */
  async sellCompleteSet(
    signer: KeyringPairOrExtSigner,
    amount: number,
    callbackOrPaymentInfo:
      | ((result: ISubmittableResult, _unsub: () => void) => void)
      | boolean = false
  ): Promise<string> {
    const tx = this.api.tx.predictionMarkets.sellCompleteSet(
      this.marketId,
      amount
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
      _resolve: (value: string | PromiseLike<string>) => void,
      _unsub: () => void
    ) => {
      const { events, status } = result;
      console.log("status:", status.toHuman());

      if (status.isInBlock) {
        events.forEach(({ phase, event: { data, method, section } }) => {
          console.log(`\t' ${phase}: ${section}.${method}:: ${data}`);

          if (method == "SoldCompleteSet") {
            _resolve(data[0].toString());
          }
          if (method == "ExtrinsicFailed") {
            _resolve("");
          }
        });
      }
    };

    return new Promise(async (resolve) => {
      if (isExtSigner(signer)) {
        const unsub = await tx.signAndSend(
          signer.address,
          { signer: signer.signer },
          (result) =>
            callback
              ? callback(result, unsub)
              : _callback(result, resolve, unsub)
        );
      } else {
        const unsub = await tx.signAndSend(signer, (result) =>
          callback ? callback(result, unsub) : _callback(result, resolve, unsub)
        );
      }
    });
  }

  /**
   * Reports an outcome for the market.
   * @param signer The actual signer provider to sign the transaction.
   * @param outcome The outcome of the market
   * @param callbackOrPaymentInfo "true" to get txn fee estimation otherwise callback to capture transaction result.
   */
  async reportOutcome(
    signer: KeyringPairOrExtSigner,
    outcome: OutcomeReport,
    callbackOrPaymentInfo:
      | ((result: ISubmittableResult, _unsub: () => void) => void)
      | boolean = false
  ): Promise<string> {
    const tx = this.api.tx.predictionMarkets.report(this.marketId, outcome);

    if (typeof callbackOrPaymentInfo === "boolean" && callbackOrPaymentInfo) {
      return estimatedFee(tx, signer.address);
    }
    const callback =
      typeof callbackOrPaymentInfo !== "boolean"
        ? callbackOrPaymentInfo
        : undefined;

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
        const unsub = await tx.signAndSend(
          signer.address,
          { signer: signer.signer },
          (result) =>
            callback
              ? callback(result, unsub)
              : _callback(result, resolve, unsub)
        );
      } else {
        const unsub = await tx.signAndSend(signer, (result) =>
          callback ? callback(result, unsub) : _callback(result, resolve, unsub)
        );
      }
    });
  }

  /**
   * Submits a disputed outcome for the market.
   * @param signer The actual signer provider to sign the transaction.
   * @param outcome The outcome of the market
   * @param callbackOrPaymentInfo "true" to get txn fee estimation otherwise callback to capture transaction result.
   */
  async dispute(
    signer: KeyringPairOrExtSigner,
    outcome: OutcomeReport,
    callbackOrPaymentInfo:
      | ((result: ISubmittableResult, _unsub: () => void) => void)
      | boolean = false
  ): Promise<string> {
    const tx = this.api.tx.predictionMarkets.dispute(this.marketId, outcome);

    if (typeof callbackOrPaymentInfo === "boolean" && callbackOrPaymentInfo) {
      return estimatedFee(tx, signer.address);
    }
    const callback =
      typeof callbackOrPaymentInfo !== "boolean"
        ? callbackOrPaymentInfo
        : undefined;

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
        const unsub = await tx.signAndSend(
          signer.address,
          { signer: signer.signer },
          (result) =>
            callback
              ? callback(result, unsub)
              : _callback(result, resolve, unsub)
        );
      } else {
        const unsub = await tx.signAndSend(signer, (result) =>
          callback ? callback(result, unsub) : _callback(result, resolve, unsub)
        );
      }
    });
  }

  /**
   * Redeems the winning shares for the market.
   * @param signer The actual signer provider to sign the transaction.
   * @param outcome The outcome of the market
   * @param callbackOrPaymentInfo "true" to get txn fee estimation otherwise callback to capture transaction result.
   */
  async redeemShares(
    signer: KeyringPairOrExtSigner,
    callbackOrPaymentInfo:
      | ((result: ISubmittableResult, _unsub: () => void) => void)
      | boolean = false
  ): Promise<string | boolean> {
    const tx = this.api.tx.predictionMarkets.redeemShares(this.marketId);

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
          (result) =>
            callback
              ? callback(result, unsub)
              : _callback(result, resolve, unsub)
        );
      } else {
        const unsub = await tx.signAndSend(signer, (result) =>
          callback ? callback(result, unsub) : _callback(result, resolve, unsub)
        );
      }
    });
  }

  /**
   * Approves the `Proposed` market that is waiting for approval from the advisory committee.
   * @param signer The actual signer provider to sign the transaction.
   * @param callbackOrPaymentInfo "true" to get txn fee estimation otherwise callback to capture transaction result.
   */
  async approve(
    signer: KeyringPairOrExtSigner,
    callbackOrPaymentInfo:
      | ((result: ISubmittableResult, _unsub: () => void) => void)
      | boolean = false
  ): Promise<string> {
    const tx = this.api.tx.predictionMarkets.approveMarket(this.marketId);

    if (typeof callbackOrPaymentInfo === "boolean" && callbackOrPaymentInfo) {
      return estimatedFee(tx, signer.address);
    }
    const callback =
      typeof callbackOrPaymentInfo !== "boolean"
        ? callbackOrPaymentInfo
        : undefined;

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
      const sudoTx = await this.api.tx.sudo.sudo(tx);

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

  /**
   * Rejects the `Proposed` market that is waiting for approval from the advisory committee.
   * @param signer The actual signer provider to sign the transaction.
   * @param callbackOrPaymentInfo "true" to get txn fee estimation otherwise callback to capture transaction result.
   */
  async reject(
    signer: KeyringPairOrExtSigner,
    callbackOrPaymentInfo:
      | ((result: ISubmittableResult, _unsub: () => void) => void)
      | boolean = false
  ): Promise<string> {
    const tx = this.api.tx.predictionMarkets.rejectMarket(this.marketId);

    if (typeof callbackOrPaymentInfo === "boolean" && callbackOrPaymentInfo) {
      return estimatedFee(tx, signer.address);
    }
    const callback =
      typeof callbackOrPaymentInfo !== "boolean"
        ? callbackOrPaymentInfo
        : undefined;

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
      const sudoTx = await this.api.tx.sudo.sudo(tx);

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

  /**
   * Allows the proposer of the market that is currently in a `Proposed` state to cancel the market proposal.
   * @param signer The actual signer provider to sign the transaction.
   * @param callbackOrPaymentInfo "true" to get txn fee estimation otherwise callback to capture transaction result.
   */
  async cancelAdvised(
    signer: KeyringPairOrExtSigner,
    callbackOrPaymentInfo:
      | ((result: ISubmittableResult, _unsub: () => void) => void)
      | boolean = false
  ): Promise<string> {
    const tx = this.api.tx.predictionMarkets.cancelPendingMarket(this.marketId);

    if (typeof callbackOrPaymentInfo === "boolean" && callbackOrPaymentInfo) {
      return estimatedFee(tx, signer.address);
    }
    const callback =
      typeof callbackOrPaymentInfo !== "boolean"
        ? callbackOrPaymentInfo
        : undefined;

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
        const unsub = await tx.signAndSend(
          signer.address,
          { signer: signer.signer },
          (result) =>
            callback
              ? callback(result, unsub)
              : _callback(result, resolve, unsub)
        );
      } else {
        const unsub = await tx.signAndSend(signer, (result) =>
          callback ? callback(result, unsub) : _callback(result, resolve, unsub)
        );
      }
    });
  }
}

export default Market;
