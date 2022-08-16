import { ApiPromise } from "@polkadot/api";
import { GraphQLClient, gql } from "graphql-request";
import { ISubmittableResult } from "@polkadot/types/types";
import { AssetIdFromString, estimatedFee, unsubOrWarns } from "../util";
import { Asset, MarketType, Pool } from "@zeitgeistpm/types/dist/interfaces";
import { Option } from "@polkadot/types";
import Decimal from "decimal.js";

import {
  MarketPeriod,
  MarketId,
  MarketResponse,
  KeyringPairOrExtSigner,
  PoolId,
  DecodedMarketMetadata,
  CurrencyIdOf,
  MarketsFilteringOptions,
  MarketsPaginationOptions,
  ActiveAssetsResponse,
  FilteredPoolsListResponse,
  FilteredPoolsListItem,
  MarketStatusText,
  MarketsOrderBy,
  MarketsOrdering,
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
  ipfsClientUrl?: string;
  endpoint: string;
};

import {
  CreateCpmmMarketAndDeployAssetsParams,
  CreateMarketParams,
} from "../types/market";

export default class Models {
  private api: ApiPromise;
  private errorTable: ErrorTable;
  private graphQLClient?: GraphQLClient;

  private ipfsClient: IPFS;
  private endpoint: string;

  private marketIds: number[];

  MAX_RPC_REQUESTS: number;

  constructor(api: ApiPromise, errorTable: ErrorTable, opts: Options) {
    this.api = api;
    this.errorTable = errorTable;
    this.MAX_RPC_REQUESTS = opts.MAX_RPC_REQUESTS || 33000;
    this.graphQLClient = opts.graphQLClient;
    this.ipfsClient = new IPFS(opts.ipfsClientUrl);
    this.endpoint = opts.endpoint;
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
   * @param {KeyringPairOrExtSigner} params.signer The actual signer provider to sign the transaction.
   * @param {string} params.oracle The address that will be responsible for reporting the market.
   * @param {MarketPeriod} params.period Start and end block numbers or milliseconds since epoch.
   * @param {MarketTypeOf} params.marketType `Categorical` or `Scalar`
   * @param {MarketDisputeMechanism} params.mdm Dispute settlement can only be `Authorized` currently
   * @param {DecodedMarketMetadata} params.metadata A hash pointer to the metadata of the market.
   * @param {string} params.swapFee The fee applied to each swap after pool creation.
   * @param {string} params.amount The amount of each token to add to the pool.
   * @param {string[]} params.weights List of relative denormalized weights of each asset.
   * @param {boolean} params.callbackOrPaymentInfo `true` to get txn fee estimation otherwise `false`
   */
  async createCpmmMarketAndDeployAssets(
    params: CreateCpmmMarketAndDeployAssetsParams
  ): Promise<boolean | string> {
    const {
      signer,
      oracle,
      period,
      metadata,
      swapFee,
      amount,
      marketType,
      mdm,
      weights,
      callbackOrPaymentInfo,
    } = params;

    const cid = await this.ipfsClient.add(
      JSON.stringify({
        ...metadata,
      })
    );

    const multihash = { Sha3_384: cid.multihash };

    const tx = this.api.tx.predictionMarkets.createCpmmMarketAndDeployAssets(
      oracle,
      period,
      multihash,
      marketType,
      mdm,
      swapFee,
      amount,
      weights
    );

    if (typeof callbackOrPaymentInfo === `boolean` && callbackOrPaymentInfo) {
      return estimatedFee(tx, signer.address);
    }

    const callback =
      typeof callbackOrPaymentInfo !== `boolean`
        ? callbackOrPaymentInfo
        : undefined;

    return new Promise(async (resolve) => {
      const _callback = (
        result: ISubmittableResult,
        _resolve: (value: boolean | PromiseLike<boolean>) => void,
        _unsub: () => void
      ) => {
        const { events, status } = result;

        if (status.isInBlock) {
          console.log(
            `Transaction included at blockHash ${status.asInBlock}\n`
          );

          events.forEach(({ event: { data, method, section } }, index) => {
            console.log(
              `Event ${index + 1} -> ${section}.${method} :: ${data}`
            );

            if (method == `MarketCreated`) {
              console.log(
                `\x1b[36m%s\x1b[0m`,
                `\nMarket created with id ${data[0].toString()}.\n`
              );
            } else if (method == `PoolCreate`) {
              console.log(
                `\x1b[36m%s\x1b[0m`,
                `\nCanonical pool for market deployed with id ${
                  data[0][`poolId`]
                }.\n`
              );
              _resolve(true);
            } else if (method == `ExtrinsicFailed`) {
              const { index, error } = data.toJSON()[0].module;
              try {
                const { errorName, documentation } = this.errorTable.getEntry(
                  index,
                  parseInt(error.substring(2, 4), 16)
                );
                console.log(
                  `\x1b[31m%s\x1b[0m`,
                  `\n${errorName}: ${documentation}`
                );
              } catch (err) {
                console.log(err);
              } finally {
                _resolve(false);
              }
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
   * Creates a new categorical or scalar market with the given parameters.
   * @param {KeyringPairOrExtSigner} params.signer The actual signer provider to sign the transaction.
   * @param {string} params.oracle The address that will be responsible for reporting the market.
   * @param {MarketPeriod} params.period Start and end block numbers or milliseconds since epoch.
   * @param {DecodedMarketMetadata} params.metadata A hash pointer to the metadata of the market.
   * @param {string} params.creationType `Permissionless` or `Advised`
   * @param {MarketTypeOf} params.marketType `Categorical` or `Scalar`
   * @param {MarketDisputeMechanism} params.mdm Dispute settlement can only be `Authorized` currently
   * @param {string} params.scoringRule The scoring rule of the market
   * @param {boolean} params.callbackOrPaymentInfo `true` to get txn fee estimation otherwise `false`
   * @returns The `marketId` that can be used to get the full data via `sdk.models.fetchMarket(marketId)`.
   */
  async createMarket(params: CreateMarketParams): Promise<string> {
    const {
      signer,
      oracle,
      period,
      metadata,
      creationType,
      marketType,
      mdm,
      scoringRule,
      callbackOrPaymentInfo,
    } = params;
    const cid = await this.ipfsClient.add(
      JSON.stringify({
        ...metadata,
      })
    );
    const multihash = { Sha3_384: cid.multihash };

    const tx = this.api.tx.predictionMarkets.createMarket(
      oracle,
      period,
      multihash,
      creationType,
      marketType,
      mdm,
      scoringRule
    );

    if (typeof callbackOrPaymentInfo === `boolean` && callbackOrPaymentInfo) {
      return estimatedFee(tx, signer.address);
    }

    const callback =
      typeof callbackOrPaymentInfo !== `boolean`
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
          console.log(
            `Transaction included at blockHash ${status.asInBlock}\n`
          );

          events.forEach(({ event: { data, method, section } }, index) => {
            console.log(`Event ${index} -> ${section}.${method} :: ${data}`);

            if (method == `MarketCreated`) {
              console.log(
                `\x1b[36m%s\x1b[0m`,
                `\nMarket created with id ${data[0].toString()}.\n`
              );
              _resolve(data[0].toString());
            } else if (method == `ExtrinsicFailed`) {
              const { index, error } = data.toJSON()[0].module;
              try {
                const { errorName, documentation } = this.errorTable.getEntry(
                  index,
                  parseInt(error.substring(2, 4), 16)
                );
                console.log(
                  `\x1b[31m%s\x1b[0m`,
                  `\n${errorName}: ${documentation}`
                );
              } catch (err) {
                console.log(err);
              } finally {
                _resolve(``);
              }
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
   * @param marketSlugText Filter assets by market slug
   * @param pagination Options for pagination
   * @returns Data needed for token trading
   */
  async queryAllActiveAssets(
    marketSlugText = "",
    pagination?: { pageNumber: number; pageSize: number }
  ): Promise<ActiveAssetsResponse> {
    if (!this.graphQLClient) {
      throw Error(
        "sdk.models.queryAllActiveAssets - no graphql client - method unavailable"
      );
    }
    const query = gql`
      query markets(
        $timestamp: BigInt
        $marketIds: [Int!]
        $marketSlugText: String
      ) {
        markets(
          where: {
            slug_contains: $marketSlugText
            status_eq: "Active"
            end_gt: $timestamp
            poolId_gte: 0
            marketId_in: $marketIds
          }
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
    }>(query, {
      timestamp,
      marketIds,
      marketSlugText,
    });

    const { markets } = data;

    const poolIds = markets.map((m) => m.poolId);

    const numPools = poolIds.length;

    if (numPools === 0) {
      return [];
    }

    const queryPools = gql`
      query poolsAssets(
        $poolIds: [Int!]
        $numPools: Int!
        $pageSize: Int
        $offset: Int!
      ) {
        pools(where: { poolId_in: $poolIds }, limit: $numPools) {
          weights {
            assetId
            len
          }
          swapFee
          poolId
          accountId
        }
        assets(
          where: { poolId_in: $poolIds }
          limit: $pageSize
          offset: $offset
          orderBy: poolId_DESC
        ) {
          assetId
          poolId
          price
          amountInPool
        }
      }
    `;

    let pageSize: number;
    let offset = 0;
    if (pagination) {
      pageSize = pagination.pageSize;
      offset = (pagination.pageNumber - 1) * pageSize;
    }

    const poolsData = await this.graphQLClient.request<{
      pools: {
        weights: {
          assetId: string;
          len: string;
        }[];
        swapFee: string;
        poolId: number;
        accountId: string;
      }[];
      assets: {
        assetId: string;
        price: number;
        amountInPool: string;
        poolId: number;
      }[];
    }>(queryPools, {
      poolIds,
      numPools,
      pageSize,
      offset,
    });

    const { pools, assets } = poolsData;

    const res: ActiveAssetsResponse = [];

    for (const asset of assets) {
      const assetStr = asset.assetId;
      const assetJson = JSON.parse(assetStr);
      const poolId = asset.poolId;
      const market = markets.find((m) => m.poolId === poolId);
      const pool = pools.find((p) => p.poolId === poolId);
      const { accountId: poolAccount } = pool;
      const catIdx = market.outcomeAssets.findIndex(
        (asset) => asset === assetStr
      );
      const metadata = market.categories[catIdx];
      const marketSlug = market.slug;
      const { weights, swapFee } = pool;
      const baseWeight = Number(weights.find((w) => w.assetId === "Ztg").len);
      const weight = Number(weights.find((w) => w.assetId === assetStr).len);
      res.push({
        baseWeight,
        weight,
        marketId: market.marketId,
        poolAccount,
        poolId,
        assetId: assetJson,
        metadata,
        marketSlug,
        swapFee,
        qty: asset.amountInPool,
        price: asset.price,
      });
    }

    return res;
  }

  async getAccountBalances(addresses: string[]) {
    const { graphQLClient } = this;
    const balancesResponse = await graphQLClient.request(
      gql`
        query PoolBalances($addresses: [String!]) {
          accountBalances(where: { account: { accountId_in: $addresses } }) {
            id
            assetId
            balance
            account {
              id
              accountId
            }
          }
        }
      `,
      {
        addresses,
      }
    );

    return balancesResponse.accountBalances;
  }

  async getMarketDataForPoolsList(pools: FilteredPoolsListResponse["pools"]) {
    const categoriesResponse: {
      markets: {
        marketId: number;
        slug: string;
        categories: {
          ticker: string;
          name: string;
          img?: string;
          color: string;
        }[];
      }[];
    } = await this.graphQLClient.request(
      gql`
        query MarketCategories($marketIds: [Int!]) {
          markets(where: { marketId_in: $marketIds }) {
            marketId
            slug
            categories {
              ticker
              name
              img
              color
            }
          }
        }
      `,
      {
        marketIds: pools.map((pool) => pool.marketId),
      }
    );
    return categoriesResponse.markets;
  }

  async getAssetsForPoolsList(pools: FilteredPoolsListResponse["pools"]) {
    const assetsResponse: {
      assets: {
        poolId: number;
        price: number;
        amountInPool: string;
        assetId: string;
      }[];
    } = await this.graphQLClient.request(
      gql`
        query Assets($poolIds: [Int!]) {
          assets(where: { poolId_in: $poolIds }) {
            assetId
            id
            poolId
            price
            amountInPool
          }
        }
      `,
      {
        poolIds: pools.map((pool) => pool.poolId),
      }
    );

    return assetsResponse.assets;
  }

  async filterPools(
    queryOptions = {
      offset: 0,
      limit: 5,
    }
  ): Promise<FilteredPoolsListItem[]> {
    const marketIds = await this.getAllMarketIds();

    const query = {
      ...queryOptions,
      marketIds,
    };

    const poolsResponse =
      await this.graphQLClient.request<FilteredPoolsListResponse>(
        gql`
          query PoolsList($offset: Int!, $limit: Int!, $marketIds: [Int!]) {
            pools(
              offset: $offset
              limit: $limit
              where: { marketId_in: $marketIds }
            ) {
              poolId
              accountId
              baseAsset
              marketId
              poolStatus
              scoringRule
              swapFee
              totalSubsidy
              totalWeight
              volume
              ztgQty
              weights {
                assetId
                len
              }
            }
          }
        `,
        query
      );

    if (!poolsResponse.pools.length) {
      return [];
    }

    const [assetsForFetchedPools, marketDataForFetchedPools] =
      await Promise.all([
        this.getAssetsForPoolsList(poolsResponse.pools),
        this.getMarketDataForPoolsList(poolsResponse.pools),
      ]);

    const pools = poolsResponse.pools
      .map((pool) => {
        const marketDataForPool = marketDataForFetchedPools.find(
          (market) => market.marketId === pool.marketId
        );

        if (!marketDataForPool.categories) {
          return null;
        }

        const assets = pool.weights.map((weight) => {
          const assetId = AssetIdFromString(weight.assetId);
          const percentage = Math.round(
            (Number(weight.len) / Number(pool.totalWeight)) * 100
          );
          const asset = assetsForFetchedPools.find(
            (asset) => asset.poolId === pool.poolId
          );
          const category =
            "categoricalOutcome" in assetId
              ? marketDataForPool.categories[assetId.categoricalOutcome[1]]
              : "ztg";
          return {
            ...asset,
            assetId,
            percentage,
            category,
          };
        });

        const liquidity = assets
          .reduce((total, asset) => {
            if (!asset.price || !asset.amountInPool) {
              return new Decimal(0);
            }
            return total.add(
              new Decimal(asset.price).mul(new Decimal(asset.amountInPool))
            );
          }, new Decimal(0))
          .toNumber();

        return {
          ...pool,
          assets,
          marketSlug: marketDataForPool.slug,
          liquidity,
        };
      })
      .filter((pool) => pool !== null);

    return pools;
  }

  private createAssetsForMarket(
    marketId: MarketId,
    marketType: MarketType | null
  ): Asset[] {
    return marketType?.isCategorical
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
      if (typeof val === "string" && marketType.categorical != null) {
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
        marketPeriod[p] = JSON.parse(`[${val}]`);
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

    const marketTypeAsType =
      marketType.categorical != null
        ? this.api.createType("MarketType", marketType)
        : this.api.createType("MarketType", {
            scalar: marketType.scalar.split(","),
          });

    const outcomeAssets = this.createAssetsForMarket(
      marketId,
      marketType.categorical != null
        ? this.api.createType("MarketType", marketType)
        : null
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

    const market = new Market(
      marketId,
      basicMarketData,
      metadata,
      this.api,
      this.errorTable
    );
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
    if (!this.graphQLClient) {
      return this.fetchMarketData(marketId);
    }
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

    return this.constructMarketFromQueryData(queriedMarketData);
  }

  private constructQueriesForMarketsFiltering(
    filteringOptions: MarketsFilteringOptions,
    countOnly = false
  ): {
    queries: string[];
    statuses: MarketStatusText[];
  } {
    // need this since `status_in` needs [String!] type which is `undefined` or non-empty array of strings
    // `statuses` variable is returned and used in queries as a variable
    const statuses = filteringOptions.statuses ?? [
      "Proposed",
      "Active",
      "Closed",
      "Disputed",
      "Reported",
      "Resolved",
    ];
    const { searchText } = filteringOptions;

    const whereSearchText = `slug_contains: ${
      searchText == null
        ? '""'
        : "$searchText, OR: { question_contains: $searchText },"
    }`;

    const where = `where: {
      status_in: $statuses ${whereSearchText}
      tags_containsAll: $tags
      creator_eq: $creator
      oracle_eq: $oracle
      poolId_gte: $minPoolId
      marketId_in: $marketIds
      outcomeAssets_containsAny: $assets
    }`;

    const countQuery = gql`
      query TotalMarketsCount(
        ${statuses.length > 0 ? "$statuses: [String!]" : ""}
        $tags: [String!]
        ${searchText == null ? "" : "$searchText: String!"}
        $creator: String
        $oracle: String
        $minPoolId: Int
        $marketIds: [Int!]
        $assets: [String!]
      ) {
        marketsConnection(
          ${where}
          orderBy: id_ASC
        ) {
          totalCount
        }
      }
    `;

    if (countOnly) {
      return { statuses, queries: [countQuery] };
    }

    const filterQuery = gql`
      query MarketPage(
        ${statuses.length > 0 ? "$statuses: [String!]" : ""}
        $tags: [String!]
        ${searchText == null ? "" : "$searchText: String!"}
        $pageSize: Int
        $offset: Int!
        $orderByQuery: [MarketOrderByInput!]
        $creator: String
        $oracle: String
        $minPoolId: Int
        $marketIds: [Int!]
        $assets: [String!]
      ) {
        markets(
          ${where}
          limit: $pageSize
          offset: $offset
          orderBy: $orderByQuery
        ) {
          ...MarketDetails
        }
      }
      ${FRAGMENT_MARKET_DETAILS}
    `;

    return {
      statuses,
      queries: [countQuery, filterQuery],
    };
  }

  /**
   * Queries count of markets for specified filter options.
   * @param param0 filtering options
   * @returns count of markets for specified filters
   */
  async queryMarketsCount(
    filteringOptions: MarketsFilteringOptions
  ): Promise<number> {
    if (!this.graphQLClient) {
      return this.getMarketCount();
    }
    const { count: totalCount } = await this.queryMarketPage(
      filteringOptions,
      {}
    );

    return totalCount;
  }

  private async queryAccountAssets(accountAddress: string): Promise<string[]> {
    if (!this.graphQLClient) {
      throw Error(
        "sdk.models.queryMarketsByAssets - no graphql client - method unavailable"
      );
    }

    const query1 = gql`
      query assetsForAccount($limit: Int!, $accountAddress: String!) {
        accountBalances(
          where: { account: { wallet_eq: $accountAddress }, balance_gt: 0 }
        ) {
          assetId
        }
      }
    `;

    const { accountBalances } = await this.graphQLClient.request<{
      accountBalances: {
        assetId: string;
      }[];
    }>(query1, { accountAddress });

    const assets = accountBalances.map((i) => i.assetId);
    return assets;
  }

  private async queryMarketPage(
    filteringOptions: MarketsFilteringOptions,
    paginationOptions: Partial<MarketsPaginationOptions>,
    countOnly = false
  ): Promise<{ result: Market[] | null; count: number }> {
    const { tags, searchText, creator, oracle, assetOwner } = filteringOptions;
    const liquidityOnly = filteringOptions.liquidityOnly ?? true;

    const marketIds = await this.getAllMarketIds();

    const { statuses, queries } = this.constructQueriesForMarketsFiltering(
      filteringOptions,
      countOnly
    );

    const [totalCountQuery, marketsQuery] = queries;

    let assets: string[];
    if (assetOwner) {
      assets = await this.queryAccountAssets(assetOwner);
    }

    let pageSize: number;
    let pageNumber: number;
    let ordering: MarketsOrdering;
    let orderBy: MarketsOrderBy;

    if (paginationOptions) {
      ({ pageSize, pageNumber, ordering, orderBy } = paginationOptions);
    }

    ordering = ordering ?? "asc";
    orderBy = orderBy ?? "newest";
    pageNumber = pageNumber ?? 1;

    const offset = pageSize ? (pageNumber - 1) * pageSize : 0;
    let orderingStr = ordering.toUpperCase();
    if (orderBy === "newest") {
      orderingStr = ordering === "asc" ? "DESC" : "ASC";
    }
    const orderByQuery =
      orderBy === "newest" ? `marketId_${orderingStr}` : `end_${orderingStr}`;

    const variables = {
      statuses,
      tags,
      searchText,
      pageSize,
      offset,
      orderByQuery,
      creator,
      oracle,
      minPoolId: liquidityOnly ? 0 : null,
      marketIds,
      assets,
    };

    const totalCountData = await this.graphQLClient.request<{
      marketsConnection: { totalCount: number };
    }>(totalCountQuery, variables);
    const { totalCount: count } = totalCountData.marketsConnection;

    if (countOnly) {
      return { count, result: null };
    }
    const marketsData = await this.graphQLClient.request<{
      markets: MarketQueryData[];
    }>(marketsQuery, variables);

    // console.log("markets", JSON.stringify(marketsData, null, 2));

    const queriedMarkets = marketsData.markets;

    const result = queriedMarkets.map((m) => {
      return this.constructMarketFromQueryData(m);
    });

    return { result, count };
  }

  async getAssetPriceHistory(
    marketId: number,
    assetId: number | string,
    startTime: string //ISO string format
  ) {
    const combinedId = `[${marketId},${
      typeof assetId === "string" ? `"${assetId}"` : assetId
    }]`;

    const query = gql`
      query PriceHistory($combinedId: String, $startTime: DateTime) {
        historicalAssets(
          where: { assetId_contains: $combinedId, timestamp_gte: $startTime }
          orderBy: blockNumber_ASC
        ) {
          newPrice
          timestamp
        }
      }
    `;

    const response = await this.graphQLClient.request<{
      historicalAssets: {
        newPrice: number;
        timestamp: string;
      }[];
    }>(query, {
      combinedId,
      startTime,
    });

    return response.historicalAssets;
  }

  async getAccountHistoricalValues(address: string, startTime: string) {
    const query = gql`
      query AccountHistory($address: String, $startTime: DateTime) {
        historicalAccountBalances(
          where: { accountId_eq: $address, timestamp_gte: $startTime }
          orderBy: timestamp_DESC
        ) {
          pvalue
          timestamp
        }
      }
    `;

    const response = await this.graphQLClient.request<{
      historicalAccountBalances: {
        pvalue: number;
        timestamp: string;
      }[];
    }>(query, {
      address,
      startTime,
    });

    const history = response.historicalAccountBalances;

    if (history.length > 0) {
      return history;
    } else {
      // if there no records within the given range we need to go back and find the last record to
      // find the current price
      const lastRecordQuery = gql`
        query LastPriceRecord($address: String) {
          historicalAccountBalances(
            where: { accountId_eq: $address }
            orderBy: timestamp_DESC
            limit: 1
          ) {
            pvalue
            timestamp
          }
        }
      `;
      const lastRecordResponse = await this.graphQLClient.request<{
        historicalAccountBalances: {
          pvalue: number;
          timestamp: string;
        }[];
      }>(lastRecordQuery, {
        address,
      });

      const lastRecord = lastRecordResponse.historicalAccountBalances;

      if (lastRecord.length > 0) {
        const lastPrice = lastRecord[0].pvalue;
        return [
          { pvalue: lastPrice, timestamp: startTime },
          { pvalue: lastPrice, timestamp: new Date().toISOString() },
        ];
      } else {
        return [];
      }
    }
  }

  /**
   * Queries subsquid indexer for market data with pagination.
   * @param param0 filtering options
   * @param paginationOptions pagination options
   * @returns collection of markets and total count for specified options
   */
  async filterMarkets(
    filteringOptions: MarketsFilteringOptions,
    paginationOptions: MarketsPaginationOptions = {
      ordering: "desc",
      orderBy: "newest",
      pageSize: 10,
      pageNumber: 1,
    }
  ): Promise<{ result: Market[]; count: number }> {
    if (this.graphQLClient == null) {
      const result = await this.getAllMarkets();
      const count = result.length;
      return { result, count };
    }
    return this.queryMarketPage(filteringOptions, paginationOptions);
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
        const raw = await this.ipfsClient.read(metadataString);

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
      this.api,
      this.errorTable
    );
  }

  /**
   * This acts as a count of all markets which have been created,
   * but includes those which have been cancelled, and all other statuses.
   * @returns The `market_count` from Zeitgeist chain.
   */
  async getMarketCount(): Promise<number> {
    const count = (await this.api.query.marketCommons.marketCounter()).toJSON();
    if (typeof count !== `number`) {
      throw new Error(
        `Expected a number to return from api.query.marketCommons.marketCounter (even if variable remains unset)`
      );
    }
    console.log(
      `\x1b[36m%s\x1b[0m`,
      `${count} markets are present in ${this.endpoint}`
    );
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
      return new Swap(poolId, pool.unwrap(), this.api, this.errorTable);
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
    const data = await this.api.rpc.chain.getBlock(blockHash);
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
