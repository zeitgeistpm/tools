import { ApiPromise } from "@polkadot/api";
import { ISubmittableResult } from "@polkadot/types/types";
import { hexToNumber, hexToString } from "@polkadot/util";
import { encodeAddress } from "@polkadot/util-crypto";
import all from "it-all";
import { concat, toString } from "uint8arrays";
import { unsubOrWarns } from "../util";

import {
  MarketEnd,
  MarketId,
  MarketResponse,
  ExtendedMarketResponse,
  PoolResponse,
  KeyringPairOrExtSigner,
  PoolId,
} from "../types";
import { initIpfs, changeEndianness, isExtSigner } from "../util";

import Market from "./market";
import Shares from "./shares";
import Swap from "./swaps";

export { Market, Shares, Swap };

export default class Models {
  public shares: Shares;

  private api: ApiPromise;

  constructor(api: ApiPromise) {
    this.api = api;
    this.shares = new Shares(this.api);
  }

  /**
   * Gets all the market ids that exist in storage.
   * Warning: This could take a while to finish.
   */
  async getAllMarketIds(): Promise<number[]> {
    const keys =
      this.api["config"] !== "mock"
        ? await this.api.query.predictionMarkets.markets.keys()
        : await this.api.query.predictionMarkets.marketIds.keys();

    return keys.map((key) => {
      const idStr = "0x" + changeEndianness(key.toString().slice(-32));
      const id = hexToNumber(idStr);
      return id;
    });
  }

  /**
   * Gets all markets that exist in storage.
   * Warning: this could take a while to finish.
   */
  async getAllMarkets(): Promise<Market[]> {
    const ids = await this.getAllMarketIds();

    return Promise.all(ids.map((id) => this.fetchMarketData(id)));
  }

  /**
   * Creates a new market with the given parameters. Returns the `marketId` that can be used
   * to get the full data via `sdk.models.fetchMarket(marketId)`.
   * @param signer The actual signer provider to sign the transaction.
   * @param title The title of the new prediction market.
   * @param description The description / extra information for the market.
   * @param oracle The address that will be responsible for reporting the market.
   * @param end Ending block or the ending unix timestamp of the market.
   * @param creationType "Permissionless" or "Advised"
   */
  async createNewMarket(
    signer: KeyringPairOrExtSigner,
    title: string,
    description: string,
    oracle: string,
    end: MarketEnd,
    creationType = "Advised",
    categories = ["Yes", "No"],
    callback?: (result: ISubmittableResult, _unsub: () => void) => void
  ): Promise<string> {
    const ipfs = initIpfs();

    const { cid } = await ipfs.add({
      content: JSON.stringify({
        title,
        description,
        categories,
      }),
    });

    return new Promise(async (resolve) => {
      const _callback = (
        result: ISubmittableResult,
        _resolve: (value: string | PromiseLike<string>) => void,
        _unsub: () => void
      ) => {
        const { events, status } = result;

        if (status.isInBlock) {
          console.log(`Transaction included at blockHash ${status.asInBlock}`);

          events.forEach(({ phase, event: { data, method, section } }) => {
            console.log(`\t' ${phase}: ${section}.${method}:: ${data}`);

            if (method == "MarketCreated") {
              _resolve(data[0].toString());
            } else if (method == "ExtrinsicFailed") {
              console.log("Extrinsic failed");
              _resolve("");
            }

            unsubOrWarns(_unsub);
          });
        }
      };

      if (isExtSigner(signer)) {
        const unsub = await this.api.tx.predictionMarkets
          .createCategoricalMarket(oracle, end, cid.toString(), creationType, categories.length)
          .signAndSend(signer.address, { signer: signer.signer }, (result) =>
            callback
              ? callback(result, unsub)
              : _callback(result, resolve, unsub)
          );
      } else {
        const unsub = await this.api.tx.predictionMarkets
          .createCategoricalMarket(oracle, end, cid.toString(), creationType, categories.length)
          .signAndSend(signer, (result) =>
            callback
              ? callback(result, unsub)
              : _callback(result, resolve, unsub)
          );
      }
    });
  }

  /**
   * Fetches data from Zeitgeist and IPFS for a market with a given identifier.
   * @param marketId The unique identifier for the market you want to fetch.
   */
  async fetchMarketData(
    marketId: MarketId,
    opts?:{ address: string },
  ): Promise<Market> {
    const ipfs = initIpfs();

    const market = (
      await this.api.query.predictionMarkets.markets(marketId)
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
      categories: ["No metadata"],
    };

    try {
      // Metadata exists, so parse it.
      if (hexToString(metadata)) {
        const raw = toString(concat(await all(ipfs.cat(metadataString))));

        try {
          // new version
          const parsed = JSON.parse(raw) as {
            title: string;
            description: string;
            categories: string[];
          };
          data = parsed;
        } catch {
          const extract = (data: string) => {
            const titlePattern = "title:";
            const infoPattern = "::info:";
            return {
              description: data.slice(
                data.indexOf(infoPattern) + infoPattern.length
              ),
              title: data.slice(titlePattern.length, data.indexOf(infoPattern)),
              categories: ["Invalid", "Yes", "No"],
            };
          };

          data = extract(raw);
        }
      }
    } catch (err) { console.error(err); }

    const shareIds = await Promise.all(
      [...Array(market.categories).keys()]
        .map((id: number) => {
          //@ts-ignore
          const shareId= this.api.createType("Asset", { predictionmarketshare: [marketId, id] });
          return shareId;
        })
        .map((id) => id.toString())
    );

     console.log('\n\n\n>>>');
     console.log(this.api.query.tokens.accounts);
     
      


     const keys = await this.api.query.tokens.accounts.keys("5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY");
     const keys2 = await this.api.query.tokens.accounts.keys("5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY");
     console.log('keys.length:', keys.length);
     console.log('keys2.length:', keys2.length);
     
     const shares = keys.map(key=> ({
      shareId: key.toString().slice(-160, -96),
      accountId: encodeAddress('0x'+ key.toString().slice(-64), 42),
     }));

     
     console.log(shares.map(({shareId, accountId})=> `shareId: ${shareId}, accountId: ${accountId}`).join('\n'));
     
     
     console.log('<<<\n\n\n');
     console.log('keys.length:', keys.length);
     console.log('<<<\n\n\n');

    const owns = (opts && opts.address)
      ? shareIds.map (shareId=>({
         shareId,
         amount: 777
        }))
      : null ;

    Object.assign(market, {
      ...data,
      marketId,
      metadataString,
      shareIds,
    });

    const extendedMarketResponse = new Market(market as ExtendedMarketResponse, this.api);
    if (owns) {
      console.log(owns);
      
      extendedMarketResponse[opts.address] = { owns };
      
    }  
    // NB: no longer ExtendedMarketResponse type, since extra field's name is an address
    return extendedMarketResponse;
  }

  /**
   * Fetches market_count variable from Zeitgeist chain
   * This acts as a count of all markets which have been created, but includes those which have
   * been cancelled, and all other statuses
   */
  async getMarketCount(): Promise<number | null> {
    const count = (
      await this.api.query.predictionMarkets.marketCount()
    ).toJSON();
    if (typeof count !== 'number')
      throw new Error('Expected a number to return from api.query.predictionMarkets.marketCount (even if variable remains unset)');
    return count;
  }

  /**
   * Gets an array of disputes for a given marketId.
   * Should throw errors where market status is such that no disputes can have been registered.
   * but all registered disputes will still be returned even if, eg, resolved.
   * To check if disputes are active, use viewMarket and check market_status for "Disputed"
   */
  async fetchDisputes(marketId: MarketId): Promise<any> {    
    const res = (
      await this.api.query.predictionMarkets.disputes(marketId)
    ).toJSON() ;

    if (!Array.isArray(res))
      throw new Error(`fetchDisputes expected response an array but got ${typeof res}.`);

    if (!res.length) {
      const market = (
        await this.api.query.predictionMarkets.markets(marketId)
      ).toJSON() as MarketResponse;
      if (!market) {
        throw new Error(`Market with market id ${marketId} does not exist.`);
      }
      if (!market.report)
        throw new Error(`Market with market id ${marketId} has not been reported and therefore has not been disputed.`);
      }

    return res;
  }

  async fetchPoolData(poolId: PoolId): Promise<Swap> {
    const poolResponse = (
      await this.api.query.swaps.pools(poolId)
    ).toJSON() as PoolResponse;

    return new Swap(poolId, poolResponse, this.api);
  }

  async getAssetsPrices(blockNumber: any): Promise<any> {
    const markets = await this.getAllMarkets();
    let priceData = {};
    for (const market of markets) {
      const assetPrices = await market.getAssetsPrices(blockNumber);
      priceData = { ...priceData, ...assetPrices };
    }
    return priceData;
  }
}
