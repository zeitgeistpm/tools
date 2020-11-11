import { hexToString } from "@polkadot/util";
import all from "it-all";
import { concat, toString } from "uint8arrays";

import { ExtendedMarketResponse, MarketId, MarketResponse, MarketCreation } from "../types";
import { initIpfs } from "../util/ipfs";
import { initApi } from "../util/polkadot";


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
  /** The end block for this market. */
  public endBlock: number;

  constructor(market: ExtendedMarketResponse) {
    const {
      creator,
      creation,
      creator_fee,
      oracle,
      end_block,
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
    this.endBlock = end_block;
  }

  /**
   * Gets a market from "remote", that is from querying Zeitgeist and IPFS.
   * @param marketId The id of the market to retrieve.
   */
  static async getRemote(marketId: MarketId): Promise<Market> {
    const api = await initApi();
    const ipfs = initIpfs();

    const market = (await api.query.predictionMarkets.markets(marketId)).toJSON() as MarketResponse;

    const { metadata } = market;
    const metadataString = hexToString(metadata);

    const data = toString(concat(await all(ipfs.cat(metadataString))));

    const extract = (data:string) => {
      const titlePattern = "title:";
      const infoPattern = "::info:";
      return {
        title: data.slice(titlePattern.length, data.indexOf(infoPattern)),
        info: data.slice(data.indexOf(infoPattern) + infoPattern.length),
      }
    }

    //@ts-ignore
    const invalidShareId = (await api.rpc.predictionMarkets.marketOutcomeShareId(0,0)).toString();
    //@ts-ignore
    const yesShareId = (await api.rpc.predictionMarkets.marketOutcomeShareId(0,1)).toString();
    //@ts-ignore
    const noShareId = (await api.rpc.predictionMarkets.marketOutcomeShareId(0,2)).toString();
    
    Object.assign(market, {
      ...extract(data),
      metadataString,
      invalidShareId,
      yesShareId,
      noShareId,
    });

    return new Market(market as ExtendedMarketResponse);
  }
}
