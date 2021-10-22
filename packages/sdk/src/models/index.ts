import { ApiPromise } from "@polkadot/api";
import { ISubmittableResult } from "@polkadot/types/types";
import { hexToNumber } from "@polkadot/util";
import { unsubOrWarns } from "../util";
import { Pool } from "@zeitgeistpm/types/dist/interfaces/swaps";
import { Option } from "@polkadot/types";

import {
  MarketEnd,
  MarketPeriod,
  MarketId,
  MarketResponse,
  KeyringPairOrExtSigner,
  PoolId,
  DecodedMarketMetadata,
  MarketDisputeMechanism,
  CurrencyIdOf,
} from "../types";
import { changeEndianness, isExtSigner } from "../util";

import Market from "./market";
import Swap from "./swaps";
import ErrorTable from "../errorTable";
import IPFS from "../storage/ipfs";

export { Market, Swap };

type Options = {
  MAX_RPC_REQUESTS?: number;
};

export default class Models {
  private api: ApiPromise;
  private errorTable: ErrorTable;
  MAX_RPC_REQUESTS: number;

  constructor(api: ApiPromise, errorTable: ErrorTable, opts: Options = {}) {
    this.api = api;
    this.errorTable = errorTable;
    this.MAX_RPC_REQUESTS = opts.MAX_RPC_REQUESTS || 33000;
  }

  /**
   * Gets all the market ids that exist in storage.
   * Warning: This could take a while to finish.
   * @returns The `marketId` of all markets.
   */
  async getAllMarketIds(): Promise<number[]> {
    const keys =
      this.api["config"] !== "mock"
        ? await this.api.query.marketCommons.markets.keys()
        : await this.api.query.marketCommons.marketIds.keys();

    return keys.map((key) => {
      const idStr = "0x" + changeEndianness(key.toString().slice(-32));
      const id = hexToNumber(idStr);
      return id;
    });
  }

  /**
   * Gets all markets that exist in storage.
   * Warning: this could take a while to finish.
   * @returns The market data using their corresponding `marketId`.
   */
  async getAllMarkets(): Promise<Market[]> {
    const ids = await this.getAllMarketIds();

    return Promise.all(ids.map((id) => this.fetchMarketData(id)));
  }

  /**
   * Creates a new categorical market with the given parameters.
   * @param signer The actual signer provider to sign the transaction.
   * @param oracle The address that will be responsible for reporting the market.
   * @param period Start and end block numbers or unix timestamp of the market.
   * @param creationType "Permissionless" or "Advised"
   * @param mdm Dispute settlement can be authorized, court or simple_disputes
   * @param metadata Market metadata
   * @returns The `marketId` that can be used to get the full data via `sdk.models.fetchMarket(marketId)`.
   */
  async createCategoricalMarket(
    signer: KeyringPairOrExtSigner,
    oracle: string,
    period: MarketPeriod,
    creationType = "Advised",
    mdm: MarketDisputeMechanism,
    scoringRule = "CPMM",
    metadata: DecodedMarketMetadata,
    callback?: (result: ISubmittableResult, _unsub: () => void) => void
  ): Promise<string> {
    const ipfs = new IPFS();
    const categories = metadata.categories;

    const cid = await ipfs.add(
      JSON.stringify({
        ...metadata,
      })
    );

    const multihash = { Sha3_384: cid.multihash };

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
              const { index, error } = data.toJSON()[0].module;
              const { errorName, documentation } = this.errorTable.getEntry(
                index,
                error
              );
              console.log(`${errorName}: ${documentation}`);
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
            period,
            multihash,
            creationType,
            categories.length,
            mdm,
            scoringRule
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
            period,
            multihash,
            creationType,
            categories.length,
            mdm,
            scoringRule
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
   * Creates a new scalar market with the given parameters.
   * @param signer The actual signer provider to sign the transaction.
   * @param title The title of the new prediction market.
   * @param description The description / extra information for the market.
   * @param oracle The address that will be responsible for reporting the market.
   * @param period Start and end block numbers or unix timestamp of the market.
   * @param creationType "Permissionless" or "Advised"
   * @param bounds The array having lower and higher bound values denoting range set.
   * @param mdm Dispute settlement can be authorized, court or simple_disputes
   * @returns The `marketId` that can be used to get the full data via `sdk.models.fetchMarket(marketId)`.
   */
  async createScalarMarket(
    signer: KeyringPairOrExtSigner,
    title: string,
    description: string,
    oracle: string,
    period: MarketPeriod,
    creationType = "Advised",
    bounds = [0, 100],
    mdm: MarketDisputeMechanism,
    scoringRule = "CPMM",
    callback?: (result: ISubmittableResult, _unsub: () => void) => void
  ): Promise<string> {
    const ipfs = new IPFS();

    const cid = await ipfs.add(
      JSON.stringify({
        title,
        description,
        bounds,
      })
    );

    const multihash = { Sha3_384: cid.multihash };

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
              const { index, error } = data.toJSON()[0].module;
              const { errorName, documentation } = this.errorTable.getEntry(
                index,
                error
              );
              console.log(`${errorName}: ${documentation}`);
              _resolve("");
            }

            unsubOrWarns(_unsub);
          });
        }
      };

      if (isExtSigner(signer)) {
        const unsub = await this.api.tx.predictionMarkets
          .createScalarMarket(
            oracle,
            period,
            multihash,
            creationType,
            bounds,
            mdm,
            scoringRule
          )
          .signAndSend(signer.address, { signer: signer.signer }, (result) =>
            callback
              ? callback(result, unsub)
              : _callback(result, resolve, unsub)
          );
      } else {
        const unsub = await this.api.tx.predictionMarkets
          .createScalarMarket(
            oracle,
            period,
            multihash,
            creationType,
            bounds,
            mdm,
            scoringRule
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
    const marketRaw = await this.api.query.marketCommons.markets(marketId);

    const marketJson = marketRaw.toJSON() as never as MarketResponse;

    if (!marketJson) {
      throw new Error(`Market with market id ${marketId} does not exist.`);
    }

    const basicMarketData: MarketResponse = { ...marketJson };
    const { metadata: metadataString } = basicMarketData;

    // Default to no metadata, but actually parse it below if it exists.
    let metadata = {
      slug: "No metadata",
    } as Partial<DecodedMarketMetadata>;

    try {
      if (metadataString) {
        const ipfs = new IPFS();
        const raw = await ipfs.read(metadataString);

        const parsed = JSON.parse(raw) as DecodedMarketMetadata;
        metadata = parsed;
      }
    } catch (err) {
      console.error(err);
    }

    //@ts-ignore
    const market = marketRaw.unwrap();

    basicMarketData.outcomeAssets = market.market_type.isCategorical
      ? [...Array(market.market_type.asCategorical.toNumber()).keys()].map(
          (catIdx) => {
            return this.api.createType("Asset", {
              categoricalOutcome: [marketId, catIdx],
            });
          }
        )
      : ["Long", "Short"].map((pos) => {
          const position = this.api.createType("ScalarPosition", pos);
          return this.api.createType("Asset", {
            scalarOutcome: [marketId, position.toString()],
          });
        });

    basicMarketData.report = market.report.isSome ? market.report.value : null;
    basicMarketData.resolved_outcome = market.resolved_outcome.isSome
      ? market.resolved_outcome.value.toNumber()
      : null;

    return new Market(
      marketId,
      basicMarketData,
      metadata as DecodedMarketMetadata,
      this.api
    );
  }

  /**
   * This acts as a count of all markets which have been created,
   * but includes those which have been cancelled, and all other statuses.
   * @returns The `market_count` from Zeitgeist chain.
   */
  async getMarketCount(): Promise<number | null> {
    const count = (await this.api.query.marketCommons.marketCount()).toJSON();
    if (typeof count !== "number") {
      throw new Error(
        "Expected a number to return from api.query.marketCommons.marketCount (even if variable remains unset)"
      );
    }
    return count;
  }

  /**
   * Should throw errors where market status is such that no disputes can have been registered,
   * but all registered disputes will still be returned even if, eg, resolved.
   * To check if disputes are active, use `viewMarket` and check market_status for "Disputed"
   * @param marketId The unique identifier for the market you want to fetch disputes.
   * @returns The array of disputes for a given market.
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
        await this.api.query.marketCommons.markets(marketId)
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

  /**
   * @param poolId The unique identifier for the pool you want to fetch data.
   * @returns `Swap` for the given `poolId`.
   */
  async fetchPoolData(poolId: PoolId): Promise<Swap | null> {
    const pool = (await this.api.query.swaps.pools(poolId)) as Option<Pool>;

    if (pool.isSome) {
      return new Swap(poolId, pool.unwrap(), this.api);
    } else {
      return null;
    }
  }

  /**
   * Can be used to find prices at a particular block using unique identifier.
   * @param blockHash The unique identifier for the block to fetch asset spot prices.
   * @returns Spot prices of all assets in all markets at Zeitgeist.
   */
  async assetSpotPricesInZtg(blockHash?: any): Promise<any> {
    const markets = await this.getAllMarkets();
    let priceData = {};

    for (const market of markets) {
      const assetPrices = await market.assetSpotPricesInZtg(blockHash);
      priceData = { ...priceData, ...assetPrices };
    }
    return priceData;
  }

  /**
   * @param blockHash The unique identifier for the block to fetch data.
   * @returns The data stored in a particular block.
   */
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

    let outstandingRequests = 0;
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

    const chunkSize = (arbitrarySet || range).length;
    console.log(`...makes ${chunkSize} blocks`);

    let timer = Date.now();

    if (chunkSize > this.MAX_RPC_REQUESTS) {
      const chunks = [];
      const whole = arbitrarySet ? [...arbitrarySet] : range;

      console.log(
        `Blocks exceed MAX_RPC_REQUESTS (${this.MAX_RPC_REQUESTS}). Chunking at: ${timer}`
      );

      while (whole.length) {
        chunks.push(whole.splice(0, this.MAX_RPC_REQUESTS));
      }
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      const chunkedExtrinsics: any[] = chunks.map((_) => new Promise(() => {}));

      const outerTrigger = chunks.reduce(async (trigger, chunk, idx) => {
        await trigger;
        console.log(
          `Chunk ${idx}: ${idx * this.MAX_RPC_REQUESTS}-${
            (idx + 1) * this.MAX_RPC_REQUESTS - 1
          }:`
        );

        chunkedExtrinsics[idx] = await this.indexTransferRecipients(
          0,
          0,
          chunk,
          filter
        );
        console.log(`Chunk ${idx}: extrinsics fetched at: ${Date.now()}`);

        return await chunkedExtrinsics[idx];
      }, chunks[0]);

      // Native Array.flat requires TS lib: "es2019" || "es2019.array" which conflict with ipfs-core-types
      const arrayFlat1 = (arr) => arr.reduce((a, b) => a.concat(b), []);

      await outerTrigger;

      console.log(`All extrinsics fetched at ${Date.now}`);

      const result = Promise.all(arrayFlat1(chunkedExtrinsics));
      return await result;
    }

    console.log("beginning retrieval at:", Date.now());

    try {
      const blockHashes = await Promise.all(
        (arbitrarySet || range).map((block, idx) => {
          outstandingRequests++;
          if (Date.now() - timer > 30000) {
            console.log(`Progress: ${idx}/${chunkSize}`);
            timer = Date.now();
          }
          return this.api.rpc.chain.getBlockHash(block);
        })
      );

      outstandingRequests = 0;
      timer = Date.now();
      const blocks = Promise.all(
        blockHashes.map((hash, idx) => {
          outstandingRequests++;
          if (Date.now() - timer > 30000) {
            console.log(`Progress: ${idx}`);
            timer = Date.now();
          }

          try {
            return this.api.rpc.chain
              .getBlock(hash)
              .then((block) => block.block);
          } catch (e) {
            console.log("Oops at:", Date.now());
            console.log(hash);

            console.log("Requests outstanding:", outstandingRequests);
          }
        })
      );
      console.log(
        (arbitrarySet || range)[0],
        "-",
        (arbitrarySet || range)[chunkSize - 1],
        ","
      );
      console.log(" chunk sent at:", Date.now());

      await blocks;
      outstandingRequests = 0;
      console.log("retrieved but not logged at:", Date.now());

      extrinsics = (await blocks).map((block) => block.extrinsics);
    } catch (e) {
      console.log("Oops at:", Date.now());
      console.log("Requests outstanding:", outstandingRequests);
      throw e;
    }

    (arbitrarySet || range).forEach((blockNum, idx) => {
      //@ts-ignore
      extrinsics[idx].blockNum = blockNum;
    });

    console.log("Requests outstanding:", outstandingRequests);

    return extrinsics;
  }

  currencyTransfer = async (
    signer: KeyringPairOrExtSigner,
    dest: string,
    currencyId: CurrencyIdOf,
    amount: number,
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

    const tx = this.api.tx.currency.transfer(dest, currencyId, amount);

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
