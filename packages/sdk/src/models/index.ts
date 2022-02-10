import { ApiPromise } from "@polkadot/api";
import { GraphQLClient, gql } from "graphql-request";
import { ISubmittableResult } from "@polkadot/types/types";
import { estimatedFee, unsubOrWarns } from "../util";
import { Asset, MarketType, Pool } from "@zeitgeistpm/types/dist/interfaces";
import { Option } from "@polkadot/types";

import {
  MarketPeriod,
  MarketId,
  MarketResponse,
  KeyringPairOrExtSigner,
  PoolId,
  DecodedMarketMetadata,
  MarketDisputeMechanism,
  CurrencyIdOf,
  MarketsOrdering,
  MarketsOrderBy,
  MarketTypeOf,
  AssetId,
  MarketsFilteringOptions,
} from "../types";
import { isExtSigner } from "../util";

import { FRAGMENT_MARKET_DETAILS, MarketQueryData } from "./graphql/market";

import Market from "./market";
import Swap from "./swaps";
import ErrorTable from "../errorTable";
import IPFS from "../storage/ipfs";

export { Market, Swap };

type Options = {
  MAX_RPC_REQUESTS?: number;
  graphQLClient?: GraphQLClient;
};

export default class Models {
  private api: ApiPromise;
  private errorTable: ErrorTable;
  private graphQLClient?: GraphQLClient;

  private marketIds: number[];

  MAX_RPC_REQUESTS: number;

  constructor(api: ApiPromise, errorTable: ErrorTable, opts: Options = {}) {
    this.api = api;
    this.errorTable = errorTable;
    this.MAX_RPC_REQUESTS = opts.MAX_RPC_REQUESTS || 33000;
    this.graphQLClient = opts.graphQLClient;
  }

  getGraphQLClient(): GraphQLClient {
    return this.graphQLClient;
  }

  /**
   * Gets all the market ids that exist in storage.
   * Warning: This could take a while to finish.
   * @returns The `marketId` of all markets.
   */
  async getAllMarketIds(): Promise<number[]> {
    if (this.marketIds) {
      return this.marketIds;
    }
    const entries = await this.api.query.marketCommons.markets.entries();

    const ids = entries.map(
      ([
        {
          args: [val],
        },
      ]) => {
        return Number(val.toHuman());
      }
    );

    ids.sort((a, b) => a - b);

    return ids;
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
   * Create a market using CPMM scoring rule, buy a complete set of the assets used and deploy
   * within and deploy an arbitrary amount of those that's greater than the minimum amount.
   * @param signer The actual signer provider to sign the transaction.
   * @param oracle The address that will be responsible for reporting the market.
   * @param period Start and end block numbers or unix timestamp of the market.
   * @param creationType "Permissionless" or "Advised"
   * @param marketType "Categorical" or "Scalar"
   * @param mdm Dispute settlement can be authorized, court or simple_disputes
   * @param metadata Market metadata
   * @param amounts List of amounts of each outcome asset that should be deployed.
   * @param baseAssetAmount Amount for native currency liquidity
   * @param weights List of relative denormalized weights of each asset price.
   * @param keep Specifies how many assets to keep.
   * @param paymentInfo "true" to get txn fee estimation otherwise "false"
   */
  async createCpmmMarketAndDeployAssets(
    signer: KeyringPairOrExtSigner,
    oracle: string,
    period: MarketPeriod,
    creationType = "Advised",
    marketType: MarketTypeOf,
    mdm: MarketDisputeMechanism,
    amounts: string[],
    baseAssetAmount: string,
    weights: string[],
    keep: string[],
    metadata: DecodedMarketMetadata,
    callbackOrPaymentInfo:
      | ((result: ISubmittableResult, _unsub: () => void) => void)
      | boolean = false
  ): Promise<string> {
    const ipfs = new IPFS();

    const cid = await ipfs.add(
      JSON.stringify({
        ...metadata,
      })
    );

    const multihash = { Sha3_384: cid.multihash };

    const tx = this.api.tx.predictionMarkets.createCpmmMarketAndDeployAssets(
      oracle,
      period,
      multihash,
      creationType,
      marketType,
      mdm,
      baseAssetAmount,
      amounts,
      weights,
      keep
    );

    if (typeof callbackOrPaymentInfo === "boolean" && callbackOrPaymentInfo) {
      return estimatedFee(tx, signer.address);
    }
    const callback =
      typeof callbackOrPaymentInfo !== "boolean"
        ? callbackOrPaymentInfo
        : undefined;
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
              unsubOrWarns(_unsub);
              console.log(
                `Market created with market ID: ${data[0].toString()}`
              );
            }
            if (method == "PoolCreate") {
              unsubOrWarns(_unsub);
              console.log(
                `Canonical pool for market deployed - pool ID: ${data[0]["poolId"]}`
              );
              _resolve(data[0]["poolId"]);
            }
            if (method == "ExtrinsicFailed") {
              unsubOrWarns(_unsub);
              const { index, error } = data.toJSON()[0].module;
              const { errorName, documentation } = this.errorTable.getEntry(
                index,
                error
              );
              console.log(`${errorName}: ${documentation}`);
              _resolve("");
            }
          });
        }
      };

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
   * Creates a new categorical market with the given parameters.
   * @param signer The actual signer provider to sign the transaction.
   * @param oracle The address that will be responsible for reporting the market.
   * @param period Start and end block numbers or unix timestamp of the market.
   * @param creationType "Permissionless" or "Advised"
   * @param mdm Dispute settlement can be authorized, court or simple_disputes
   * @param metadata Market metadata
   * @param paymentInfo "true" to get txn fee estimation otherwise "false"
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
    callbackOrPaymentInfo:
      | ((result: ISubmittableResult, _unsub: () => void) => void)
      | boolean = false
  ): Promise<string> {
    const ipfs = new IPFS();
    const categories = metadata.categories;

    const cid = await ipfs.add(
      JSON.stringify({
        ...metadata,
      })
    );

    const multihash = { Sha3_384: cid.multihash };

    const tx = this.api.tx.predictionMarkets.createCategoricalMarket(
      oracle,
      period,
      multihash,
      creationType,
      categories.length,
      mdm,
      scoringRule
    );

    if (typeof callbackOrPaymentInfo === "boolean" && callbackOrPaymentInfo) {
      return estimatedFee(tx, signer.address);
    }
    const callback =
      typeof callbackOrPaymentInfo !== "boolean"
        ? callbackOrPaymentInfo
        : undefined;

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
   * Creates a new scalar market with the given parameters.
   * @param signer The actual signer provider to sign the transaction.
   * @param title The title of the new prediction market.
   * @param description The description / extra information for the market.
   * @param oracle The address that will be responsible for reporting the market.
   * @param period Start and end block numbers or unix timestamp of the market.
   * @param creationType "Permissionless" or "Advised"
   * @param bounds The array having lower and higher bound values denoting range set.
   * @param mdm Dispute settlement can be authorized, court or simple_disputes
   * @param paymentInfo "true" to get txn fee estimation otherwise "false"
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
    callbackOrPaymentInfo:
      | ((result: ISubmittableResult, _unsub: () => void) => void)
      | boolean = false
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

    const tx = this.api.tx.predictionMarkets.createScalarMarket(
      oracle,
      period,
      multihash,
      creationType,
      bounds,
      mdm,
      scoringRule
    );

    if (typeof callbackOrPaymentInfo === "boolean" && callbackOrPaymentInfo) {
      return estimatedFee(tx, signer.address);
    }
    const callback =
      typeof callbackOrPaymentInfo !== "boolean"
        ? callbackOrPaymentInfo
        : undefined;

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
   * Queries all active assets from subsquid indexer.
   * @returns data needed for token trading
   */
  async queryAllActiveAssets(): Promise<
    {
      baseWeight: number;
      weight: number;
      marketId: number;
      poolId: number;
      assetId: AssetId;
      slug: string;
      swapFee: string;
      categories: { ticker: string; name: string; color: string };
    }[]
  > {
    const query = gql`
      query markets($timestamp: BigInt, $limit: Int!, $marketIds: [Int!]) {
        markets(
          where: {
            slug_contains: ""
            status_eq: "Active"
            end_gt: $timestamp
            poolId_gte: 0
            marketId_in: $marketIds
          }
          limit: $limit
          orderBy: marketId_DESC
        ) {
          marketId
          slug
          categories {
            name
            ticker
            color
            img
          }
          poolId
          outcomeAssets
        }
      }
    `;
    const timestamp = parseInt(
      (await this.api.query.timestamp.now()).toString()
    );

    const marketIds = await this.getAllMarketIds();

    const data = await this.graphQLClient.request<{
      markets: {
        outcomeAssets: string[];
        marketId: number;
        poolId: number;
        slug: string;
        categories: { ticker: string; name: string; color: string };
      }[];
    }>(query, { limit: Math.pow(2, 31) - 1, timestamp, marketIds });

    const { markets } = data;

    const res = [];

    for (const market of markets) {
      const assetStrings = market.outcomeAssets;
      const pool = (await this.api.query.swaps.pools(
        market.poolId
      )) as Option<Pool>;
      const poolUnwrapped = pool.unwrap();
      const weights = poolUnwrapped.weights.toJSON();
      const swapFee = poolUnwrapped.swapFee.toString();
      const baseWeight = weights["Ztg"];
      for (const [idx, assetStr] of Array.from(assetStrings.entries())) {
        const assetJson = JSON.parse(assetStr);
        const weight = weights[assetStr];
        res.push({
          baseWeight,
          weight,
          marketId: market.marketId,
          poolId: market.poolId,
          assetId: assetJson,
          categories: market.categories[idx],
          slug: market.slug,
          swapFee,
        });
      }
    }
    return res;
  }

  private createAssetsForMarket(
    marketId: MarketId,
    marketType: MarketType
  ): Asset[] {
    return marketType.isCategorical
      ? [...Array(marketType.asCategorical.toNumber()).keys()].map((catIdx) => {
          return this.api.createType("Asset", {
            categoricalOutcome: [marketId, catIdx],
          });
        })
      : ["Long", "Short"].map((pos) => {
          const position = this.api.createType("ScalarPosition", pos);
          return this.api.createType("Asset", {
            scalarOutcome: [marketId, position.toString()],
          });
        });
  }

  private constructMarketFromQueryData(data: MarketQueryData): Market {
    const { marketType, period, mdm, marketId } = data;

    for (const type in marketType) {
      const val = marketType[type];
      if (val == null) {
        continue;
      }
      if (typeof val === "string") {
        marketType[type] = Number(val);
      }
    }

    const marketPeriod: Partial<MarketPeriod> = {};

    for (const p in period) {
      const val = period[p];
      if (val == null) {
        continue;
      }
      if (typeof val === "string") {
        marketPeriod[p] = JSON.parse(val);
      }
    }

    for (const dispMech in mdm) {
      const val = mdm[dispMech];
      if (val == null) {
        delete mdm[dispMech];
      } else {
        mdm[dispMech] = val;
      }
    }

    const metadata: DecodedMarketMetadata = {
      question: data.question,
      slug: data.slug,
      categories: data.categories,
      description: data.description,
      tags: data.tags ?? [],
      img: data.img,
    };

    const marketTypeAsType = this.api.createType("MarketType", marketType);

    const outcomeAssets = this.createAssetsForMarket(
      marketId,
      this.api.createType("MarketType", marketType)
    );

    const marketReport =
      data.report != null ? this.api.createType("Report", data.report) : null;

    const basicMarketData: MarketResponse = {
      end: data.end,
      creation: data.creation,
      creator: data.creator,
      creatorFee: 0,
      scoringRule: data.scoringRule,
      oracle: data.oracle,
      status: data.status,
      outcomeAssets,
      marketType: marketTypeAsType,
      mdm: this.api.createType("MarketDisputeMechanism", mdm).toJSON(),
      report: marketReport,
      period: this.api.createType("MarketPeriod", marketPeriod).toJSON(),
      //@ts-ignore
      resolvedOutcome: data.resolvedOutcome,
    };

    const market = new Market(marketId, basicMarketData, metadata, this.api);
    if (data.poolId != null) {
      market.poolId = data.poolId;
    }
    return market;
  }

  /**
   *
   * @param marketId market identifier
   * @returns [[Market]] for specified identifier
   */
  async queryMarket(marketId: MarketId): Promise<Market | undefined> {
    const query = gql`
      query marketData($marketId: Int!) {
        markets(where: { marketId_eq: $marketId, slug_contains: "" }) {
          ...MarketDetails
        }
      }
      ${FRAGMENT_MARKET_DETAILS}
    `;

    const data = await this.graphQLClient.request<{
      markets: MarketQueryData[];
    }>(query, { marketId });

    const queriedMarketData = data.markets[0];

    if (!queriedMarketData) {
      return;
    }

    const now = parseInt((await this.api.query.timestamp.now()).toString());

    if (queriedMarketData.end < BigInt(now)) {
      queriedMarketData.status = "Ended";
    }

    return this.constructMarketFromQueryData(queriedMarketData);
  }

  /**
   * Queries count of markets for specified filter options.
   * @param param0 filtering options
   * @returns count of markets for specified filters
   */
  async queryMarketsCount({
    statuses,
    tags,
    slug = "",
    question,
    creator,
    oracle,
    liquidityOnly = true,
  }: MarketsFilteringOptions) {
    const marketIds = await this.getAllMarketIds();
    const containsEnded = statuses?.includes("Ended") ?? false;
    const containsActive = statuses?.includes("Active") ?? false;

    if (containsEnded) {
      statuses = statuses.filter((s) => s !== "Ended");
      if (!containsActive) {
        statuses.push("Active");
      }
    }

    let activeStatuses: string[] | undefined = [];

    if (containsActive || containsEnded) {
      activeStatuses.push("Active");
    }

    if (statuses?.includes("Proposed")) {
      activeStatuses.push("Proposed");
    }

    const restStatuses = statuses?.filter((s) => s !== "Active") ?? [];

    if (activeStatuses.length === 0 && restStatuses.length === 0) {
      activeStatuses = undefined;
    }

    const wherePart = `where: {
      OR: [
        {
          status_in: $activeStatuses
          tags_containsAll: $tags
          creator_eq: $creator
          oracle_eq: $oracle
          slug_contains: $slug
          question_contains: $question
          end_gt: $lt_end
          end_lt: $gt_end
          poolId_gte: $minPoolId
          marketId_in: $marketIds
        },
        {
          status_in: $restStatuses
          tags_containsAll: $tags
          creator_eq: $creator
          oracle_eq: $oracle
          slug_contains: $slug
          question_contains: $question
          poolId_gte: $minPoolId
          marketId_in: $marketIds
        }
      ]
    }`;

    const totalCountQuery = gql`
      query totalCount(
        $activeStatuses: [String!]
        $restStatuses: [String!]
        $tags: [String!]
        $slug: String
        $question: String
        $creator: String
        $oracle: String
        $lt_end: BigInt
        $gt_end: BigInt
        $minPoolId: Int
        $marketIds: [Int!]
      ) {
        marketsConnection(
          ${wherePart}
        ) {
          totalCount
        }
      }
    `;

    const timestamp = parseInt(
      (await this.api.query.timestamp.now()).toString()
    );

    const totalCountData = await this.graphQLClient.request<{
      marketsConnection: {
        totalCount: number;
      };
    }>(totalCountQuery, {
      activeStatuses,
      restStatuses,
      tags,
      slug,
      question,
      creator,
      oracle,
      lt_end: !containsEnded && containsActive ? timestamp : undefined,
      gt_end: containsEnded && !containsActive ? timestamp : undefined,
      minPoolId: liquidityOnly ? 0 : undefined,
      marketIds,
    });
    const { totalCount } = totalCountData.marketsConnection;

    return totalCount;
  }

  /**
   * Queries subsquid indexer for market data with pagination.
   * @param param0 filtering options
   * @param paginationOptions pagination options
   * @returns collection of markets and total count for specified options
   */
  async filterMarkets(
    {
      statuses,
      tags,
      slug = "",
      question,
      creator,
      oracle,
      liquidityOnly = true,
    }: MarketsFilteringOptions,
    paginationOptions: {
      ordering: MarketsOrdering;
      orderBy: MarketsOrderBy;
      pageSize: number;
      pageNumber: number;
    } = { ordering: "desc", orderBy: "newest", pageSize: 10, pageNumber: 1 }
  ): Promise<{ result: Market[]; count: number }> {
    if (this.graphQLClient == null) {
      throw Error("(getMarketsWithStatuses) cannot use without graphQLClient.");
    }
    const containsEnded = statuses?.includes("Ended") ?? false;
    const containsActive = statuses?.includes("Active") ?? false;

    if (containsEnded) {
      statuses = statuses.filter((s) => s !== "Ended");
      if (!containsActive) {
        statuses.push("Active");
      }
    }

    let activeStatuses: string[] | undefined = [];

    if (containsActive || containsEnded) {
      activeStatuses.push("Active");
    }

    if (statuses?.includes("Proposed")) {
      activeStatuses.push("Proposed");
    }

    const restStatuses = statuses?.filter((s) => s !== "Active") ?? [];

    if (activeStatuses.length === 0 && restStatuses.length === 0) {
      activeStatuses = undefined;
    }

    const marketIds = await this.getAllMarketIds();

    const wherePart = `where: {
      OR: [
        {
          status_in: $activeStatuses
          tags_containsAll: $tags
          creator_eq: $creator
          oracle_eq: $oracle
          slug_contains: $slug
          question_contains: $question
          end_gt: $lt_end
          end_lt: $gt_end
          poolId_gte: $minPoolId
          marketId_in: $marketIds
        },
        {
          status_in: $restStatuses
          tags_containsAll: $tags
          creator_eq: $creator
          oracle_eq: $oracle
          slug_contains: $slug
          question_contains: $question
          poolId_gte: $minPoolId
          marketId_in: $marketIds
        }
      ]
    }`;

    const marketsQuery = gql`
      query marketPage(
        $activeStatuses: [String!]
        $restStatuses: [String!]
        $tags: [String!]
        $slug: String
        $question: String
        $pageSize: Int!
        $offset: Int!
        $orderByQuery: [MarketOrderByInput!]
        $creator: String
        $oracle: String
        $lt_end: BigInt
        $gt_end: BigInt
        $minPoolId: Int
        $marketIds: [Int!]
      ) {
        markets(
          ${wherePart}
          limit: $pageSize
          offset: $offset
          orderBy: $orderByQuery
        ) {
          ...MarketDetails
        }
      }
      ${FRAGMENT_MARKET_DETAILS}
    `;

    const totalCountQuery = gql`
      query totalCount(
        $activeStatuses: [String!]
        $restStatuses: [String!]
        $tags: [String!]
        $slug: String
        $question: String
        $creator: String
        $oracle: String
        $lt_end: BigInt
        $gt_end: BigInt
        $minPoolId: Int
        $marketIds: [Int!]
      ) {
        marketsConnection(
          ${wherePart}
        ) {
          totalCount
        }
      }
    `;

    const { pageSize, pageNumber, ordering, orderBy } = paginationOptions;

    const offset = (pageNumber - 1) * pageSize;
    let orderingStr = ordering.toUpperCase();
    if (orderBy === "newest") {
      orderingStr = ordering === "asc" ? "DESC" : "ASC";
    }
    const orderByQuery =
      orderBy === "newest" ? `marketId_${orderingStr}` : `end_${orderingStr}`;

    const timestamp = parseInt(
      (await this.api.query.timestamp.now()).toString()
    );

    const marketsData = await this.graphQLClient.request<{
      markets: MarketQueryData[];
    }>(marketsQuery, {
      activeStatuses,
      restStatuses,
      tags,
      slug,
      question,
      pageSize,
      offset,
      orderByQuery,
      creator,
      oracle,
      lt_end: !containsEnded && containsActive ? timestamp : undefined,
      gt_end: containsEnded && !containsActive ? timestamp : undefined,
      minPoolId: liquidityOnly ? 0 : undefined,
      marketIds,
    });

    const { markets: queriedMarkets } = marketsData;

    const totalCountData = await this.graphQLClient.request<{
      marketsConnection: {
        totalCount: number;
      };
    }>(totalCountQuery, {
      activeStatuses,
      restStatuses,
      tags,
      slug,
      question,
      creator,
      oracle,
      lt_end: !containsEnded && containsActive ? timestamp : undefined,
      gt_end: containsEnded && !containsActive ? timestamp : undefined,
      minPoolId: liquidityOnly ? 0 : undefined,
      marketIds,
    });

    const { totalCount: count } = totalCountData.marketsConnection;

    for (const market of queriedMarkets) {
      if (market.status === "Active" && market.end < BigInt(timestamp)) {
        market.status = "Ended";
      }
    }

    const result = queriedMarkets.map((m) =>
      this.constructMarketFromQueryData(m)
    );

    return { result, count };
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

    basicMarketData.outcomeAssets = this.createAssetsForMarket(
      marketId,
      market.marketType
    );

    basicMarketData.report = market.report.isSome ? market.report.value : null;
    basicMarketData.resolvedOutcome = market.resolvedOutcome.isSome
      ? market.resolvedOutcome.value.toNumber()
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
    const count = (await this.api.query.marketCommons.marketCounter()).toJSON();
    if (typeof count !== "number") {
      throw new Error(
        "Expected a number to return from api.query.marketCommons.marketCounter (even if variable remains unset)"
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

  /**
   * Transfers specified asset from self to any account.
   * @param signer The actual signer provider to sign the transaction.
   * @param dest The address that will receive the asset (token).
   * @param currencyId Can be outcome tokens or PoolShare or Ztg.
   * @param amount The number of `currencyId` to be transferred.
   * @param paymentInfo "true" to get txn fee estimation otherwise "false"
   * @returns True or False
   */
  currencyTransfer = async (
    signer: KeyringPairOrExtSigner,
    dest: string,
    currencyId: CurrencyIdOf,
    amount: number,
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
}
