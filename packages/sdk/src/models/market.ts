import { ApiPromise } from "@polkadot/api";
import { KeyringPair } from "@polkadot/keyring/types";
import { hexToString } from "@polkadot/util";
import all from "it-all";
import { concat, toString } from "uint8arrays";

import {
  ExtendedMarketResponse,
  MarketId,
  MarketResponse,
  MarketCreation,
} from "../types";
import { initApi, initIpfs } from "../util";

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

  /** Internally hold a reference to the API. */
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

  static async createNew(
    signer: KeyringPair,
    title: string,
    description: string,
    oracle: string,
    creationType = "Permissionless"
  ): Promise<any> {
    const api = await initApi();
    const ipfs = initIpfs();

    const { cid } = await ipfs.add({
      content: `title:${title}::info:${description}`,
    });

    const unsub = await api.tx.predictionMarkets
      .create(oracle, "Binary", 500000, cid.toString(), creationType)
      .signAndSend(signer, (result) => {
        const { events, status } = result;

        if (status.isInBlock) {
          console.log(`Transaction included at blockHash ${status.asInBlock}`);

          events.forEach(({ phase, event: { data, method, section } }) => {
            console.log(`\t' ${phase}: ${section}.${method}:: ${data}`);
          });

          unsub();
          return;
        }
      });
  }

  /**
   * Gets a market from "remote", that is from querying Zeitgeist and IPFS.
   * @param marketId The id of the market to retrieve.
   */
  static async getRemote(marketId: MarketId): Promise<Market> {
    const api = await initApi();
    const ipfs = initIpfs();

    const market = (
      await api.query.predictionMarkets.markets(marketId)
    ).toJSON() as MarketResponse;

    if (!market) {
      throw new Error(`Market with market id ${marketId} does not exist.`);
    }

    const { metadata } = market;
    const metadataString = hexToString(metadata);

    // Default to no metadata, but actually parse it below if it exists.
    let data = {
      description: "No metadata",
      title: "No metadata",
    };

    // Metadata exists, so parse it.
    if (hexToString(metadata)) {
      const raw = toString(concat(await all(ipfs.cat(metadataString))));

      const extract = (data: string) => {
        const titlePattern = "title:";
        const infoPattern = "::info:";
        return {
          description: data.slice(
            data.indexOf(infoPattern) + infoPattern.length
          ),
          title: data.slice(titlePattern.length, data.indexOf(infoPattern)),
        };
      };

      data = extract(raw);
    }

    //@ts-ignore
    const invalidShareId = await api.rpc.predictionMarkets.marketOutcomeShareId(
      marketId,
      0
    );

    //@ts-ignore
    const yesShareId = await api.rpc.predictionMarkets.marketOutcomeShareId(
      marketId,
      1
    );

    //@ts-ignore
    const noShareId = await api.rpc.predictionMarkets.marketOutcomeShareId(
      marketId,
      2
    );

    Object.assign(market, {
      ...data,
      marketId,
      metadataString,
      invalidShareId: invalidShareId.toString(),
      yesShareId: yesShareId.toString(),
      noShareId: noShareId.toString(),
    });

    return new Market(market as ExtendedMarketResponse, api);
  }

  toJSONString(): string {
    const market = Object.assign({}, this);
    delete market.api;
    return JSON.stringify(market, null, 2);
  }

  async buyCompleteSet(signer: KeyringPair, amount: number): Promise<boolean> {
    const unsub = await this.api.tx.predictionMarkets
      .buyCompleteSet(this.marketId, amount)
      .signAndSend(signer, (result) => {
        const { status } = result;

        if (status.isInBlock) {
          unsub();
        }
      });

    return true;
  }

  async sellCompleteSet(signer: KeyringPair, amount: number): Promise<boolean> {
    const unsub = await this.api.tx.predictionMarkets
      .sellCompleteSet(this.marketId, amount)
      .signAndSend(signer, (result) => {
        const { status } = result;

        if (status.isInBlock) {
          unsub();
        }
      });

    return true;
  }
}

export default Market;
