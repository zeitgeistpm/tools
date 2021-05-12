import { ApiPromise } from "@polkadot/api";
import { ISubmittableResult } from "@polkadot/types/types";
import { hexToNumber, hexToString } from "@polkadot/util";
import all from "it-all";
import { concat, toString } from "uint8arrays";
import { unsubOrWarns } from "../util";
import { Pool } from "@zeitgeistpm/types/dist/interfaces/swaps";
import { Option } from "@polkadot/types";

import {
  MarketEnd,
  MarketId,
  MarketResponse,
  ExtendedMarketResponse,
  KeyringPairOrExtSigner,
  PoolId,
} from "../types";
import { initIpfs, changeEndianness, isExtSigner } from "../util";

import Market from "./market";
import Swap from "./swaps";

export { Market, Swap };

export default class Models {
  private api: ApiPromise;

  constructor(api: ApiPromise) {
    this.api = api;
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
          .createCategoricalMarket(
            oracle,
            end,
            cid.toString(),
            creationType,
            categories.length
          )
          .signAndSend(signer.address, { signer: signer.signer }, (result) =>
            callback
              ? callback(result, unsub)
              : _callback(result, resolve, unsub)
          );
      } else {
        const unsub = await this.api.tx.predictionMarkets
          .createCategoricalMarket(
            oracle,
            end,
            cid.toString(),
            creationType,
            categories.length
          )
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
  async fetchMarketData(marketId: MarketId): Promise<Market> {
    const ipfs = initIpfs();

    const marketRaw = await this.api.query.predictionMarkets.markets(marketId);

    // TODO: type (#???)
    const marketJson = (marketRaw.toJSON() as any) as MarketResponse;

    if (!marketJson) {
      throw new Error(`Market with market id ${marketId} does not exist.`);
    }

    const extendedMarket = marketJson;

    //@ts-ignore
    const { metadata } = marketJson;
    const metadataString = hexToString(metadata.toString());

    // Default to no metadata, but actually parse it below if it exists.
    let data = {
      description: "No metadata",
      title: "No metadata",
      categories: ["No metadata"],
    };

    try {
      // Metadata exists, so parse it.
      if (metadataString) {
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
    } catch (err) {
      console.error(err);
    }

    //@ts-ignore
    const market = marketRaw.unwrap();

    //@ts-ignore
    const outcomeAssets = market.market_type.isCategorical
      ? //@ts-ignore
        [...Array(market.market_type.asCategorical.toNumber()).keys()].map(
          (catIdx) => {
            //@ts-ignore
            return this.api.createType("Asset", {
              categoricalOutcome: [marketId, catIdx],
            });
          }
        )
      : ["Long", "Short"].map((pos) => {
          //@ts-ignore
          const position = this.api.createType("ScalarPosition", pos);
          //@ts-ignore
          return this.api.createType("Asset", {
            scalarOutcome: [marketId, position.toString()],
          });
        });

    Object.assign(extendedMarket, {
      ...data,
      marketId,
      metadataString,
      outcomeAssets,
    });

    const extendedMarketResponse = new Market(
      (extendedMarket as any) as ExtendedMarketResponse,
      this.api
    );

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
    if (typeof count !== "number") {
      throw new Error(
        "Expected a number to return from api.query.predictionMarkets.marketCount (even if variable remains unset)"
      );
    }
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
    ).toJSON();

    if (!Array.isArray(res)) {
      throw new Error(
        `fetchDisputes expected response an array but got ${typeof res}.`
      );
    }

    if (!res.length) {
      const market = (
        await this.api.query.predictionMarkets.markets(marketId)
      ).toJSON();
      if (!market) {
        throw new Error(`Market with market id ${marketId} does not exist.`);
      }
      //@ts-ignore
      if (!market.report) {
        throw new Error(
          `Market with market id ${marketId} has not been reported and therefore has not been disputed.`
        );
      }
    }

    return res;
  }

  async fetchPoolData(poolId: PoolId): Promise<Swap | null> {
    const pool = (await this.api.query.swaps.pools(poolId)) as Option<Pool>;

    if (pool.isSome) {
      return new Swap(poolId, pool.unwrap(), this.api);
    } else {
      return null;
    }
  }

  async assetSpotPricesInZtg(blockHash?: any): Promise<any> {
    const markets = await this.getAllMarkets();
    let priceData = {};

    for (const market of markets) {
      const assetPrices = await market.assetSpotPricesInZtg(blockHash);
      priceData = { ...priceData, ...assetPrices };
    }
    return priceData;
  }

  async getBlockData(blockHash?: any): Promise<any> {
    console.log(blockHash.toString());

    const data = await this.api.rpc.chain.getBlock(blockHash);
    console.log(data);
    return data;
  }

  async indexTransferRecipients(
    startBlock = 0,
    endBlock?: number,
    arbitrarySet?: number[],
    filter?: any
  ): Promise<any[]> {
    const index = {};
    const head = this.api.rpc.chain.getHeader();
    console.log([...Array(endBlock)]);

    let currentConnections = 0;
    let extrinsics = [];

    const range = [
      ...Array(
        Number(endBlock) || (await (await head).number.toNumber())
      ).keys(),
    ].slice(startBlock || 0);
    if (arbitrarySet) {
      console.log(arbitrarySet);
    } else {
      console.log(`${startBlock} to ${endBlock}`);
      console.log(range);
    }
    console.log(`...makes ${(arbitrarySet || range).length} blocks`);

    let timer = Date.now();
    console.log("beginning retrieval at:", timer);

    try {
      const blockHashes = await Promise.all(
        (arbitrarySet || range).map((block, idx) => {
          currentConnections++;
          if (timer - Date.now() > 30000) {
            console.log(`Progress: ${idx}`);
            timer = Date.now();
          }
          return this.api.rpc.chain.getBlockHash(block);
        })
      );

      currentConnections = 0;
      timer = Date.now();
      const blocks = await Promise.all(
        blockHashes.map((hash, idx) => {
          currentConnections++;
          if (timer - Date.now() > 30000) {
            console.log(`Progress: ${idx}`);
            timer = Date.now();
          }
          return this.api.rpc.chain.getBlock(hash).then((block) => block.block);
        })
      );
      console.log("retrieved but not logged at:", Date.now());
      currentConnections = 0;

      extrinsics = blocks.map((block) => block.extrinsics);
    } catch (e) {
      console.log("Oops at:", Date.now());
      console.log(
        `Oh, dear - was it too many connections? There are ${currentConnections}`
      );
      throw e;
    }

    (arbitrarySet || range).forEach((blockNum, idx) => {
      //@ts-ignore
      extrinsics[idx].blockNum = blockNum;
    });

    // console.log(extrinsics.map((e, idx) => e && e[0] && e[0].length ? e[0].length : (e && e[0] && e[0].length ===0 ? 0 : `empty at ${idx}`)));

    // console.log(res);

    // return ["anything"];
    // return res;
    console.log("connections:", currentConnections);

    return extrinsics;
  }
}
