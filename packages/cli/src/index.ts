import program, { Option } from "commander";

import approveMarket from "./actions/approveMarket";
import getBlockHashes from "./actions/blockHashes";
import buyAssetsAndDeployPool from "./actions/buyAssetsAndDeployPool";
import buyCompleteSet from "./actions/buyCompleteSet";
import createScalarMarket from "./actions/createScalarMarket";
import cancelPendingMarket from "./actions/cancelPendingMarket";
import countMarkets from "./actions/countMarkets";
import createMarketAndDeployPool from "./actions/createMarketAndDeployPool";
import createCategoricalMarket from "./actions/createCategoricalMarket";
import currencyTransfer from "./actions/currencyTransfer";
import deployKusamaDerby from "./actions/deployKusamaDerby";
import deployPool from "./actions/deployPool";
import disputeMarket from "./actions/disputeMarket";
import exitPool from "./actions/exitPool";
import getAllMarketIds from "./actions/getAllMarketIds";
import getAllMarkets from "./actions/getAllMarkets";
import getAssetsPrices from "./actions/getAssetsPrices";
import getShareBalance from "./actions/getShareBalance";
import getShareBalances from "./actions/getShareBalances";
import getSpotPrice from "./actions/getSpotPrice";
import joinPool from "./actions/joinPool";
import poolJoinWithExactAssetAmount from "./actions/poolJoinWithExactAssetAmount";
import redeemShares from "./actions/redeemShares";
import rejectMarket from "./actions/rejectMarket";
import reportMarket from "./actions/reportMarket";
import sellCompleteSet from "./actions/sellCompleteSet";
import swapExactAmountIn from "./actions/swapExactAmountIn";
import swapExactAmountOut from "./actions/swapExactAmountOut";
import transfer from "./actions/transfer";
import viewDisputes from "./actions/viewDisputes";
import viewMarket from "./actions/viewMarket";
import viewSpotPrices from "./actions/viewPoolSpotPrices";
import viewSwap from "./actions/viewSwap";

import queryAllMarketIds from "./actions/graphql/queryAllMarketIds";
import queryMarket from "./actions/graphql/queryMarket";
import queryFilteredMarkets from "./actions/graphql/queryFilteredMarkets";
import queryAllActiveAssets from "./actions/graphql/queryAllActiveAssets";
import queryMarketsCountForTag from "./actions/graphql/queryMarketsCountForTag";

/** Wrapper function to catch errors and exit. */
const catchErrorsAndExit = async (fn: any, opts: any) => {
  try {
    await fn(opts);
    process.exit(0); // exit OK
  } catch (e) {
    console.log(e);
    process.exit(1); // exit ERR
  }
};

program
  .command("deployKusamaDerby")
  .option(
    "--endpoint <string>",
    "The endpoint URL of the API connection",
    "wss://bsr.zeitgeist.pm"
  )
  .option("--seed <string>", "The signer's seed", "//Alice")
  .action((opts) => catchErrorsAndExit(deployKusamaDerby, opts));

program
  .command(
    "createMarketAndDeployPool <slug> <description> <oracle> <period> <question> <swapFee> <amount>"
  )
  .option(
    "-c --categories [categories...]",
    "A space-separated strings for names of categories for the market"
  )
  .option("--seed <string>", "The signer's seed", "//Alice")
  .option(
    "--endpoint <string>",
    "The endpoint URL of the API connection",
    "wss://bsr.zeitgeist.pm"
  )
  .option(
    "--timestamp",
    "Interpret period as a unix timestamp instead of a block number",
    false
  )
  .option("--grace-period <string>", "Grace Period", "0")
  .option("--oracle-duration <string>", "Oracle Duration", "60000")
  .option("--dispute-duration <string>", "Dispute Duration", "20000")
  .option(
    "--authorized <string>",
    "Specify account id which is authorized to handle Market Dispute Mechanism"
  )
  .option(
    "--court",
    "Use Court instead of Simple Disputes as Market Dispute Mechanism",
    false
  )
  .option(
    "--weights <string>",
    "A comma-separated list of relative denormalized weights of each asset price",
    ""
  )
  .option(
    "--estimate-fee",
    "Instead of executing transaction on-chain, simply return transaction fee estimation",
    false
  )
  .action(
    (
      slug: string,
      description: string,
      oracle: string,
      period: string,
      question: string,
      swapFee: string,
      amount: string,
      opts: {
        endpoint: string;
        seed: string;
        categories: string[];
        timestamp: boolean;
        authorized: string;
        court: boolean;
        weights: string;
      }
    ) =>
      catchErrorsAndExit(
        createMarketAndDeployPool,
        Object.assign(opts, {
          slug,
          description,
          oracle,
          period,
          question,
          swapFee,
          amount,
        })
      )
  );

program
  .command(
    "createCategoricalMarket <slug> <description> <oracle> <period> <question>"
  )
  .option(
    "--advised",
    "Create Advised market instead of Permissionless market",
    false
  )
  .option(
    "-c --categories [categories...]",
    "A space-separated strings for names of categories for the market"
  )
  .option("--seed <string>", "The signer's seed", "//Alice")
  .option(
    "--endpoint <string>",
    "The endpoint URL of the API connection",
    "wss://bsr.zeitgeist.pm"
  )
  .option(
    "--timestamp",
    "Interpret period as a unix timestamp instead of a block number",
    false
  )
  .option("--grace-period <string>", "Grace Period", "0")
  .option("--oracle-duration <string>", "Oracle Duration", "60000")
  .option("--dispute-duration <string>", "Dispute Duration", "20000")
  .option(
    "--authorized <string>",
    "Specify account id which is authorized to handle Market Dispute Mechanism"
  )
  .option(
    "--court",
    "Use Court instead of Simple Disputes as Market Dispute Mechanism",
    false
  )
  .option(
    "--cpmm",
    "Use cpmm as a scoring rule instead of RikiddoSigmoidFeeMarketEma",
    false
  )
  .option(
    "--estimate-fee",
    "Instead of creating a market estimate transaction fee and display it",
    false
  )
  .action(
    (
      slug: string,
      description: string,
      oracle: string,
      period: string,
      question: string,
      opts: {
        endpoint: string;
        seed: string;
        categories: string[];
        advised: boolean;
        timestamp: boolean;
        authorized: string;
        court: boolean;
        cpmm: boolean;
      }
    ) =>
      catchErrorsAndExit(
        createCategoricalMarket,
        Object.assign(opts, { slug, description, oracle, period, question })
      )
  );

program
  .command("createScalarMarket <title> <description> <oracle> <period>")
  .option(
    "--advised",
    "Create Advised market instead of Permissionless market",
    false
  )
  .option(
    "-b --bounds [bounds...]",
    "A space-separated lower and higher bound for the market"
  )
  .option("--seed <string>", "The signer's seed", "//Alice")
  .option(
    "--endpoint <string>",
    "The endpoint URL of the API connection",
    "wss://bsr.zeitgeist.pm"
  )
  .option(
    "--timestamp",
    "Interpret period as a unix timestamp instead of a block number",
    false
  )
  .option("--grace-period <string>", "Grace Period", "0")
  .option("--oracle-duration <string>", "Oracle Duration", "60000")
  .option("--dispute-duration <string>", "Dispute Duration", "20000")
  .option(
    "--authorized <string>",
    "Specify account id which is authorized to handle Market Dispute Mechanism"
  )
  .option(
    "--court",
    "Use Court instead of Simple Disputes as Market Dispute Mechanism",
    false
  )
  .option(
    "--cpmm",
    "Use cpmm as a scoring rule instead of RikiddoSigmoidFeeMarketEma",
    false
  )
  .action(
    (
      title: string,
      description: string,
      oracle: string,
      period: string,
      opts: {
        endpoint: string;
        seed: string;
        categories: string[];
        advised: boolean;
        timestamp: boolean;
        authorized: string;
        court: boolean;
        cpmm: boolean;
      }
    ) =>
      catchErrorsAndExit(
        createScalarMarket,
        Object.assign(opts, { title, description, oracle, period })
      )
  );

program
  .command("blockHashes")
  .option("-b, --blocks [blocks...]", "the blocks to retrieve hashes of")
  .option("--link", "Include a block explorer link", true)
  .option(
    "--endpoint <string>",
    "The endpoint URL of the API connection",
    "wss://bsr.zeitgeist.pm"
  )
  .action((opts: { blocks: number[]; link: boolean; endpoint: string }) =>
    catchErrorsAndExit(getBlockHashes, Object.assign(opts))
  );

program
  .command("viewMarket <marketId>")
  .option(
    "--address <string>",
    "An address on which to report ownership of assets."
  )
  .option(
    "--seed <string>",
    "A seed from which to calculate an address on which to report ownership of assets",
    "//Alice"
  )
  .option(
    "--endpoint <string>",
    "The endpoint URL of the API connection",
    "wss://bsr.zeitgeist.pm"
  )
  .action((marketId: number, opts) =>
    catchErrorsAndExit(viewMarket, Object.assign(opts, { marketId }))
  );

program
  .command("cancelMarket <marketId>")
  .option("--seed <string>", "The signer's seed", "//Alice")
  .option(
    "--endpoint <string>",
    "The endpoint URL of the API connection",
    "wss://bsr.zeitgeist.pm"
  )
  .action((marketId: number, opts) =>
    catchErrorsAndExit(cancelPendingMarket, Object.assign(opts, { marketId }))
  );

program
  .command("viewSwap <marketId>")
  .option(
    "--endpoint <string>",
    "The endpoint URL of the API connection",
    "wss://bsr.zeitgeist.pm"
  )
  .action((marketId: number, opts) =>
    catchErrorsAndExit(viewSwap, Object.assign(opts, { marketId }))
  );

program
  .command("buyCompleteSet <marketId> <amount>")
  .option("--seed <string>", "The signer's seed", "//Alice")
  .option(
    "--endpoint <string>",
    "The endpoint URL of the API connection",
    "wss://bsr.zeitgeist.pm"
  )
  .action(
    (
      marketId: number,
      amount: number,
      opts: { endpoint: string; seed: string }
    ) =>
      catchErrorsAndExit(
        buyCompleteSet,
        Object.assign(opts, { marketId, amount })
      )
  );

program
  .command("sellCompleteSet <marketId> <amount>")
  .option("--seed <string>", "The signer's seed", "//Alice")
  .option(
    "--endpoint <string>",
    "The endpoint URL of the API connection",
    "wss://bsr.zeitgeist.pm"
  )
  .action((marketId: number, amount: number, opts: { seed: string }) =>
    catchErrorsAndExit(
      sellCompleteSet,
      Object.assign(opts, { marketId, amount })
    )
  );

program
  .command("report <marketId> <outcome>")
  .option("--seed <string>", "The signer's seed", "//Alice")
  .option(
    "--endpoint <string>",
    "The endpoint URL of the API connection",
    "wss://bsr.zeitgeist.pm"
  )
  .action((marketId: number, outcome: number, opts: { seed: string }) =>
    catchErrorsAndExit(reportMarket, Object.assign(opts, { marketId, outcome }))
  );

program
  .command("dispute <marketId> <outcome>")
  .option("--seed <string>", "The signer's seed", "//Alice")
  .option(
    "--endpoint <string>",
    "The endpoint URL of the API connection",
    "wss://bsr.zeitgeist.pm"
  )
  .action((marketId: number, outcome: number, opts: { seed: string }) =>
    catchErrorsAndExit(
      disputeMarket,
      Object.assign(opts, { marketId, outcome })
    )
  );

program
  .command("redeem <marketId>")
  .option("--seed <string>", "The signer's seed", "//Alice")
  .option(
    "--endpoint <string>",
    "The endpoint URL of the API connection",
    "wss://bsr.zeitgeist.pm"
  )
  .action((marketId: number, opts: { seed: string }) =>
    catchErrorsAndExit(redeemShares, Object.assign(opts, { marketId }))
  );

program
  .command("buyAssetsAndDeployPool <marketId> <swapFee> <amount>")
  .option("--seed <string>", "The signer's seed", "//Alice")
  .option(
    "--endpoint <string>",
    "The endpoint URL of the API connection",
    "wss://bsr.zeitgeist.pm"
  )
  .option(
    "--weights <weights>",
    "A comma-separated list of lengths for each asset",
    ""
  )
  .action(
    (
      marketId: number,
      swapFee: string,
      amount: string,
      opts: { endpoint: string; seed: string; weights: string }
    ) =>
      catchErrorsAndExit(
        buyAssetsAndDeployPool,
        Object.assign(opts, { marketId, swapFee, amount })
      )
  );

program
  .command("deployPool <marketId> <swapFee> <amount>")
  .option("--seed <string>", "The signer's seed", "//Alice")
  .option(
    "--endpoint <string>",
    "The endpoint URL of the API connection",
    "wss://bsr.zeitgeist.pm"
  )
  .option(
    "--weights <weights>",
    "A comma-separated list of lengths for each asset",
    ""
  )
  .action(
    (
      marketId: number,
      swapFee: string,
      amount: string,
      opts: { endpoint: string; seed: string; weights: string }
    ) =>
      catchErrorsAndExit(
        deployPool,
        Object.assign(opts, { marketId, swapFee, amount })
      )
  );

program
  .command("joinPool <poolId> <amountOut> <amountIn>")
  .option("--seed <string>", "The signer's seed", "//Alice")
  .option(
    "--endpoint <string>",
    "The endpoint URL of the API connection",
    "wss://bsr.zeitgeist.pm"
  )
  .action(
    (
      poolId: number,
      amountOut: number,
      amountIn: string,
      opts: { seed: string; endpoint: string }
    ) =>
      catchErrorsAndExit(
        joinPool,
        Object.assign(opts, { amountOut, amountIn, poolId })
      )
  );

program
  .command(
    "poolJoinWithExactAssetAmount <poolId> <assetIn> <assetAmount> <minPoolAmount>"
  )
  .option("--seed <string>", "The signer's seed", "//Alice")
  .option(
    "--endpoint <string>",
    "The endpoint URL of the API connection",
    "wss://bsr.zeitgeist.pm"
  )
  .action(
    (
      poolId: number,
      assetIn: string,
      assetAmount: string,
      minPoolAmount: string,
      opts: { seed: string; endpoint: string }
    ) =>
      catchErrorsAndExit(
        poolJoinWithExactAssetAmount,
        Object.assign(opts, { poolId, assetIn, assetAmount, minPoolAmount })
      )
  );

program
  .command("exitPool <poolId> <amountIn> <amountOut>")
  .option("--seed <string>", "The signer's seed", "//Alice")
  .option(
    "--endpoint <string>",
    "The endpoint URL of the API connection",
    "wss://bsr.zeitgeist.pm"
  )
  .action(
    (
      poolId: number,
      amountIn: string,
      amountOut: string,
      opts: { seed: string; endpoint: string }
    ) =>
      catchErrorsAndExit(
        exitPool,
        Object.assign(opts, { amountIn, amountOut, poolId })
      )
  );

program
  .command("swapExactAmountIn <poolId> <assetIn> <assetAmountIn> <assetOut>")
  .option("--seed <string>", "The signer's seed", "//Alice")
  .option(
    "--endpoint <string>",
    "The endpoint URL of the API connection",
    "wss://bsr.zeitgeist.pm"
  )
  .option(
    "--minAmountOut <string>",
    "Minimum asset amount that can leave the pool"
  )
  .option(
    "--maxPrice <string>",
    "Market price must be equal or less than the provided value"
  )
  .action(
    (
      poolId: number,
      assetIn: string,
      assetAmountIn: string,
      assetOut: string,
      opts: {
        seed: string;
        endpoint: string;
        minAmountOut: string;
        maxPrice: string;
      }
    ) =>
      catchErrorsAndExit(
        swapExactAmountIn,
        Object.assign(opts, {
          assetIn,
          assetAmountIn,
          assetOut,
          poolId,
        })
      )
  );

program
  .command("swapExactAmountOut <poolId> <assetIn> <assetOut> <assetAmountOut>")
  .option("--seed <string>", "The signer's seed", "//Alice")
  .option(
    "--endpoint <string>",
    "The endpoint URL of the API connection",
    "wss://bsr.zeitgeist.pm"
  )
  .option(
    "--maxAmountIn <string>",
    "Maximum asset amount that can enter the pool"
  )
  .option(
    "--maxPrice <string>",
    "Market price must be equal or less than the provided value"
  )
  .action(
    (
      poolId: number,
      assetIn: string,
      assetOut: string,
      assetAmountOut: string,
      opts: {
        seed: string;
        endpoint: string;
        maxAmountIn: string;
        maxPrice: string;
      }
    ) =>
      catchErrorsAndExit(
        swapExactAmountOut,
        Object.assign(opts, {
          assetIn,
          assetOut,
          assetAmountOut,
          poolId,
        })
      )
  );

program
  .command("getBalance <addressOrSeed>, <asset>")
  .option(
    "--endpoint <string>",
    "The endpoint URL of the API connection",
    "wss://bsr.zeitgeist.pm"
  )
  .action((addressOrSeed = "//Alice", asset, opts: { endpoint: string }) =>
    catchErrorsAndExit(
      getShareBalance,
      Object.assign(opts, { addressOrSeed, asset })
    )
  );

program
  .command("getBalances <addressOrSeed>")
  .option("-m --marketId <number>")
  .option("--endpoint <string>", "The endpoint URL of the API connection")
  .action(
    (addressOrSeed = "//Alice", opts: { marketId: number; endpoint: string }) =>
      catchErrorsAndExit(
        getShareBalances,
        Object.assign(opts, { addressOrSeed })
      )
  );

program
  .command("getSpotPrice <poolId> <assetIn> <assetOut>")
  .option(
    "--endpoint <string>",
    "The endpoint URL of the API connection",
    "wss://bsr.zeitgeist.pm"
  )
  .action(
    (
      poolId: string,
      assetIn: string,
      assetOut: string,
      opts: { endpoint: string }
    ) =>
      catchErrorsAndExit(
        getSpotPrice,
        Object.assign(opts, { poolId, assetIn, assetOut })
      )
  );

program
  .command("viewSpotPrices <poolId> <assetIn> <assetOut> [blocks...]")
  .option(
    "--endpoint <string>",
    "The endpoint URL of the API connection",
    "wss://bsr.zeitgeist.pm"
  )
  .action(
    (
      poolId: string,
      assetIn: string,
      assetOut: string,
      blocks: string,
      opts: { endpoint: string }
    ) =>
      catchErrorsAndExit(
        viewSpotPrices,
        Object.assign(opts, { poolId, assetIn, assetOut, blocks })
      )
  );

program
  .command("getAssetsPrices")
  .option(
    "-b --block <number>",
    "The block number at which to get historic prices"
  )
  .option(
    "--endpoint <string>",
    "The endpoint URL of the API connection",
    "wss://bsr.zeitgeist.pm"
  )
  .action((opts: { block: number; endpoint: string }) =>
    catchErrorsAndExit(getAssetsPrices, opts)
  );

program
  .command("transfer <marketId> <sharesIndex> <to> <amount>")
  .option("--seed <string>", "The signer's seed", "//Alice")
  .option(
    "--endpoint <string>",
    "The endpoint URL of the API connection",
    "wss://bsr.zeitgeist.pm"
  )
  // TODO: check if these params really should be string!
  .action(
    (
      marketId: string,
      sharesIndex: string,
      to: string,
      amount: string,
      opts: { endpoint: string; seed: string }
    ) =>
      catchErrorsAndExit(
        transfer,
        Object.assign(opts, { marketId, sharesIndex, to, amount })
      )
  );

program
  .command("currencyTransfer <dest> <amount")
  .option(
    "--seed <string>",
    "The seed used to derive the address from which the assets should be transferred",
    "//Alice"
  )
  .option(
    "--endpoint <string>",
    "The endpoint URL of the API connection",
    "wss://bsr.zeitgeist.pm"
  )
  .option("--marketId <string>", "The unique identifier of the market")
  .option(
    "--categoryIndex <number>",
    "An index from the list of categories as categorical outcome"
  )
  .option(
    "--scalarPos <string>",
    "The scalar position can be either Long or Short"
  )
  .option("--poolShare <number>", "The amount of pool share to be transferred")
  .option("--ztg", "Use ztg as currency instead of CombinatorialOutcome", false)
  .action((dest: string, amount: number, opts) =>
    catchErrorsAndExit(currencyTransfer, Object.assign(opts, { dest, amount }))
  );

program
  .command("countMarkets")
  .option(
    "--endpoint <string>",
    "The endpoint URL of the API connection",
    "wss://bsr.zeitgeist.pm"
  )
  .action((opts: { endpoint: string }) =>
    catchErrorsAndExit(countMarkets, Object.assign(opts))
  );

program
  .command("getAllMarketIds")
  .option(
    "--endpoint <string>",
    "The endpoint URL of the API connection",
    "wss://bsr.zeitgeist.pm"
  )
  .action((opts: { endpoint: string }) =>
    catchErrorsAndExit(getAllMarketIds, Object.assign(opts))
  );

program
  .command("getAllMarkets")
  .option("-f, --filter [fields...]", "only output specified fields")
  .option(
    "--endpoint <string>",
    "The endpoint URL of the API connection",
    "wss://bsr.zeitgeist.pm"
  )
  .action((opts: { endpoint: string; filter: string[] }) =>
    catchErrorsAndExit(getAllMarkets, Object.assign(opts))
  );

program
  .command("approveMarket <marketId>")
  .option(
    "--endpoint <string>",
    "The endpoint URL of the API connection",
    "wss://bsr.zeitgeist.pm"
  )
  .option(
    "--seed <string>",
    "The signer's seed. Must be an ApprovalOrigin",
    "//Alice"
  )
  .action((marketId: number, opts) =>
    catchErrorsAndExit(approveMarket, Object.assign(opts, { marketId }))
  );

program
  .command("rejectMarket <marketId> <reason>")
  .option(
    "--endpoint <string>",
    "The endpoint URL of the API connection",
    "wss://bsr.zeitgeist.pm"
  )
  .option(
    "--seed <string>",
    "The signer's seed. Must be an ApprovalOrigin",
    "//Alice"
  )
  .action((marketId: number, reason: string, opts) =>
    catchErrorsAndExit(rejectMarket, Object.assign(opts, { marketId, reason }))
  );

program
  .command("viewDisputes <marketId>")
  .option(
    "--endpoint <string>",
    "The endpoint URL of the API connection",
    "wss://bsr.zeitgeist.pm"
  )
  .action((marketId: number, opts: { endpoint: string }) =>
    catchErrorsAndExit(viewDisputes, Object.assign(opts, { marketId }))
  );

// graphql
program
  .command("queryMarketIds")
  .option(
    "--endpoint <string>",
    "The endpoint URL of the API connection",
    "wss://bsr.zeitgeist.pm"
  )
  .option(
    "--graphQlEndpoint <string>",
    "Endpoint of the graphql query node",
    "https://processor.zeitgeist.pm/graphql"
  )
  .action((opts) => {
    catchErrorsAndExit(queryAllMarketIds, opts);
  });

program
  .command("queryMarket <marketId>")
  .option(
    "--endpoint <string>",
    "The endpoint URL of the API connection",
    "wss://bsr.zeitgeist.pm"
  )
  .option(
    "--graphQlEndpoint <string>",
    "Endpoint of the graphql query node",
    "https://processor.zeitgeist.pm/graphql"
  )
  .action((marketId, opts) => {
    marketId = Number(marketId);
    catchErrorsAndExit(queryMarket, { marketId, ...opts });
  });

program
  .command("queryFilteredMarkets")
  .option(
    "--endpoint <string>",
    "The endpoint URL of the API connection",
    "wss://bsr.zeitgeist.pm"
  )
  .option(
    "--graphQlEndpoint <string>",
    "Endpoint of the graphql query node",
    "https://processor.zeitgeist.pm/graphql"
  )
  .option(
    "--statuses [strings...]",
    "Statuses of markets to display. By default shows all statuses"
  )
  .option(
    "--tags [strings...]",
    "Filter markets by supplied tags. By default shows all tags"
  )
  .option(
    "--search-text [string]",
    "Show markets containing this text in slug or question"
  )
  .option(
    "--no-liquidity",
    "Also, show markets without liquidity in results. By default only markets with liquidity are shown"
  )
  .option(
    "--creator [string]",
    "Filter only markets created by account address"
  )
  .option("--oracle [string]", "Filter only markets created by market oracle")
  .option(
    "--asset-owner [string]",
    "Get market for which supplied account owns any of the market assets"
  )
  .option("--page-number <number>", "Page number of market results", "1")
  .option("--page-size <number>", "Page size for the results", "100")
  .addOption(
    new Option("--ordering <string>", "Ordering of markets")
      .choices(["asc", "desc"])
      .default("asc")
  )
  .addOption(
    new Option("--order-by <string>", "Order markets by paramater")
      .choices(["newest", "end", "popular"])
      .default("newest")
  )
  .action(
    ({
      graphQlEndpoint,
      endpoint,
      statuses,
      tags,
      searchText,
      pageNumber,
      pageSize,
      ordering,
      orderBy,
      creator,
      oracle,
      liquidity,
      assetOwner,
    }: {
      graphQlEndpoint: string;
      endpoint: string;
      statuses?: string | string[];
      tags?: string | string[];
      searchText?: string;
      pageNumber: string;
      pageSize: string;
      ordering: string;
      orderBy: string;
      creator?: string;
      oracle?: string;
      liquidity: boolean;
      assetOwner?: string;
    }) => {
      if (typeof statuses === "string") {
        statuses = [statuses];
      }
      if (typeof tags === "string") {
        tags = [tags];
      }
      catchErrorsAndExit(queryFilteredMarkets, {
        statuses,
        tags,
        searchText,
        graphQlEndpoint,
        endpoint,
        pageNumber: Number(pageNumber),
        pageSize: Number(pageSize),
        ordering,
        orderBy,
        creator,
        oracle,
        liquidityOnly: liquidity,
        assetOwner,
      });
    }
  );

program
  .command("queryAllActiveAssets")
  .description(
    "Display all tradeable assets information. For pagination, both --page-number and --page-size options must be supplied."
  )
  .option(
    "--endpoint <string>",
    "The endpoint URL of the API connection",
    "wss://bsr.zeitgeist.pm"
  )
  .option(
    "--graphQlEndpoint <string>",
    "Endpoint of the graphql query node",
    "https://processor.zeitgeist.pm/graphql"
  )
  .option(
    "--market-slug <string>",
    "Include only assets form markets containing text in slug"
  )
  .option("--page-number <number>", "Page number for paginating results", "1")
  .option("--page-size <number>", "Page size for paginating results.")
  .action(
    ({
      endpoint,
      graphQlEndpoint,
      marketSlug,
      pageNumber,
      pageSize,
    }: {
      graphQlEndpoint: string;
      endpoint: string;
      marketSlug?: string;
      pageNumber?: number;
      pageSize?: number;
    }) => {
      catchErrorsAndExit(queryAllActiveAssets, {
        graphQlEndpoint,
        endpoint,
        marketSlug,
        pageNumber: Number(pageNumber),
        pageSize: Number(pageSize),
      });
    }
  );

program
  .command("queryMarketsCountForTag")
  .option(
    "--endpoint <string>",
    "The endpoint URL of the API connection",
    "wss://bsr.zeitgeist.pm"
  )
  .option(
    "--graphQlEndpoint <string>",
    "Endpoint of the graphql query node",
    "https://processor.zeitgeist.pm/graphql"
  )
  .option(
    "--tag <string>",
    "Filter markets by supplied tags. By default shows all tags"
  )
  .action(
    ({
      graphQlEndpoint,
      endpoint,
      tag,
    }: {
      graphQlEndpoint: string;
      endpoint: string;
      tag: string;
    }) => {
      catchErrorsAndExit(queryMarketsCountForTag, {
        tag,
        graphQlEndpoint,
        endpoint,
      });
    }
  );

program.parse(process.argv);
