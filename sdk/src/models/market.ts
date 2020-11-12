
import { hexToString } from "@polkadot/util";
import all from "it-all";
import { concat, toString } from "uint8arrays";

import { ExtendedMarketResponse, MarketId, MarketResponse, MarketCreation } from "../types";
import { initApi, initIpfs } from "../util";

/**
 * The Market class initializes all the market data.
 */
class Market {
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

  constructor(market: ExtendedMarketResponse) {
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
    this.title = title;
    this.description = description;
    this.metadataString = metadataString;
    this.invalidShareId = invalidShareId;
    this.yesShareId = yesShareId;
    this.noShareId = noShareId;
  }

  /**
   * Gets a market from "remote", that is from querying Zeitgeist and IPFS.
   * @param marketId The id of the market to retrieve.
   */
  static async getRemote(marketId: MarketId): Promise<Market> {
    const api = await initApi();
    const ipfs = initIpfs();

    const market = (await api.query.predictionMarkets.markets(marketId)).toJSON() as MarketResponse;

    if (!market) {
      throw new Error(`Market with market id ${marketId} does not exist.`);
    }

    const { metadata } = market;
    const metadataString = hexToString(metadata);

    // Default to no metadata, but actually parse it below if it exists.
    let data = {
      description: 'No metadata',
      title: 'No metadata',
    };

    // Metadata exists, so parse it.
    if (hexToString(metadata)) {
      const raw = toString(concat(await all(ipfs.cat(metadataString))));

      const extract = (data:string) => {
        const titlePattern = "title:";
        const infoPattern = "::info:";
        return {
          description: data.slice(data.indexOf(infoPattern) + infoPattern.length),
          title: data.slice(titlePattern.length, data.indexOf(infoPattern)),
        }
      }

      data = extract(raw);
    }


    //@ts-ignore
    const invalidShareId = (await api.rpc.predictionMarkets.marketOutcomeShareId(marketId,0)).toString();
    //@ts-ignore
    const yesShareId = (await api.rpc.predictionMarkets.marketOutcomeShareId(marketId,1)).toString();
    //@ts-ignore
    const noShareId = (await api.rpc.predictionMarkets.marketOutcomeShareId(marketId,2)).toString();
    
    Object.assign(market, {
      ...data,
      metadataString,
      invalidShareId,
      yesShareId,
      noShareId,
    });

    return new Market(market as ExtendedMarketResponse);
  }
}


export default Market;
