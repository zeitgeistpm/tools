import { ApiPromise } from "@polkadot/api";
import { KeyringPair } from "@polkadot/keyring/types";
import { ISubmittableResult } from "@polkadot/types/types";

import {
  ExtendedMarketResponse,
  KeyringPairOrExtSigner,
  MarketCreation,
} from "../types";
import { isExtSigner } from "../util";

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
  public end: number;
  /** The hex-encoded raw metadata for the market. */
  public metadata: string;
  /** The type of market. */
  public marketType: string; // <- TODO add a real type for this
  /** The status of the market. */
  public marketStatus: string;
  /** The reported outcome of the market. Null if the market was not reported yet. */
  public reportedOutcome: number | null;
  /** The reporter of the market. Null if the market was not reported yet. */
  public reporter: string | null;
  /** The categories of a categorical market. Null if not a categorical market. */
  public categories: string[] | null;
  /** The title of the market. */
  public title: string;
  /** The description of the market. */
  public description: string;
  /** The metadata string. */
  public metadataString: string;
  /** The `Invalid` share hash id. */
  public invalidShareId: string;
  /** The `Yes` share hash id.  */
  public yesShareId: string;
  /** The `No` share hash id. */
  public noShareId: string;

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
      reported_outcome,
      reporter,
      categories,
      marketId,
      title,
      description,
      metadataString,
      invalidShareId,
      yesShareId,
      noShareId,
    } = market;

    this.creator = creator;
    this.creation = creation as MarketCreation;
    this.creatorFee = creator_fee;
    this.oracle = oracle;
    this.end = end;
    this.metadata = metadata;
    this.marketType = market_type;
    this.marketStatus = market_status;
    this.reportedOutcome = reported_outcome;
    this.reporter = reporter;
    this.categories = categories;
    this.marketId = marketId;
    this.title = title;
    this.description = description;
    this.metadataString = metadataString;
    this.invalidShareId = invalidShareId;
    this.yesShareId = yesShareId;
    this.noShareId = noShareId;

    this.api = api;
  }

  toJSONString(): string {
    const market = Object.assign({}, this);
    delete market.api;
    return JSON.stringify(market, null, 2);
  }

  getPoolId = async (): Promise<number | null> => {
    return (
      await this.api.query.predictionMarkets.marketToSwapPool(this.marketId)
    ).toHuman() as number;
  };

  deploySwapPool = async (
    signer: KeyringPairOrExtSigner,
    weights: string[]
  ): Promise<string> => {
    const poolId = await this.getPoolId();
    if (poolId) {
      throw new Error("Pool already exists for this market.");
    }

    return new Promise(async (resolve) => {
      const callback = (
        result: ISubmittableResult,
        _resolve: (value: string | PromiseLike<string>) => void,
        _unsub: () => void
      ) => {
        const { events, status } = result;
        console.log("status:", status.toHuman());

        if (status.isInBlock) {
          events.forEach(({ phase, event: { data, method, section } }) => {
            console.log(`\t' ${phase}: ${section}.${method}:: ${data}`);

            if (method == "PoolCreated") {
              _resolve(data[0].toString());
            }
            if (method == "ExtrinsicFailed") {
              _resolve("");
            }
          });
          _unsub();
        }
      };

      if (isExtSigner(signer)) {
        const unsub = await this.api.tx.predictionMarkets
          .deploySwapPoolForMarket(this.marketId, weights)
          .signAndSend(signer.address, { signer: signer.signer }, (result) =>
            callback(result, resolve, unsub)
          );
      } else {
        const unsub = await this.api.tx.predictionMarkets
          .deploySwapPoolForMarket(this.marketId, weights)
          .signAndSend(signer, (result) => callback(result, resolve, unsub));
      }
    });
  };
  0.3333333333;
  async buyCompleteSet(
    signer: KeyringPairOrExtSigner,
    amount: number
  ): Promise<boolean> {
    const callback = (
      result: ISubmittableResult,
      _resolve: (value: boolean | PromiseLike<boolean>) => void,
      _unsub: () => void
    ) => {
      const { status } = result;

      if (status.isInBlock) {
        _unsub();
      }

      _resolve(true);
    };

    return new Promise(async (resolve) => {
      if (isExtSigner(signer)) {
        const unsub = await this.api.tx.predictionMarkets
          .buyCompleteSet(this.marketId, amount)
          .signAndSend(signer.address, { signer: signer.signer }, (result) =>
            callback(result, resolve, unsub)
          );
      } else {
        const unsub = await this.api.tx.predictionMarkets
          .buyCompleteSet(this.marketId, amount)
          .signAndSend(signer, (result) => callback(result, resolve, unsub));
      }
    });
  }

  async sellCompleteSet(
    signer: KeyringPairOrExtSigner,
    amount: number
  ): Promise<boolean> {
    const callback = (
      result: ISubmittableResult,
      _resolve: (value: boolean | PromiseLike<boolean>) => void,
      _unsub: () => void
    ) => {
      const { status } = result;

      if (status.isInBlock) {
        _unsub();
      }

      _resolve(true);
    };

    return new Promise(async (resolve) => {
      if (isExtSigner(signer)) {
        const unsub = await this.api.tx.predictionMarkets
          .sellCompleteSet(this.marketId, amount)
          .signAndSend(signer.address, { signer: signer.signer }, (result) =>
            callback(result, resolve, unsub)
          );
      } else {
        const unsub = await this.api.tx.predictionMarkets
          .sellCompleteSet(this.marketId, amount)
          .signAndSend(signer, (result) => callback(result, resolve, unsub));
      }
    });
  }
}

export default Market;
