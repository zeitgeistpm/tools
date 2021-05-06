import program from "commander";

import buyCompleteSet from "./actions/buyCompleteSet";
import createMarket from "./actions/createMarket";
import cancelPendingMarket from "./actions/cancelPendingMarket";
import disputeMarket from "./actions/disputeMarket";
import reportMarket from "./actions/reportMarket";
import deployPool from "./actions/deployPool";
import joinPool from "./actions/joinPool";
import exitPool from "./actions/exitPool";
import swapExactAmountIn from "./actions/swapExactAmountIn";
import swapExactAmountOut from "./actions/swapExactAmountOut";
import viewMarket from "./actions/viewMarket";
import viewSwap from "./actions/viewSwap";
import sellCompleteSet from "./actions/sellCompleteSet";
import getShareBalance from "./actions/getShareBalance";
import getSpotPrice from "./actions/getSpotPrice";
import wrapNativeCurrency from "./actions/wrapNativeCurrency";
import transfer from "./actions/transfer";
import redeemShares from "./actions/redeemShares";
import getAssetsPrices from "./actions/getAssetsPrices";
import countMarkets from "./actions/countMarkets";
import getAllMarketIds from "./actions/getAllMarketIds";
import getAllMarkets from "./actions/getAllMarkets";
import viewDisputes from "./actions/viewDisputes";
import approveMarket from "./actions/approveMarket";
import rejectMarket from "./actions/rejectMarket";

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
  .command("createMarket <title> <description> <oracle> <end>")
  .option(
    "--no-advised",
    "Create Permissionless market instead of Advised market"
  )
  .option("-c --categories [categories...]", "specify at least two categories")
  .option("--seed <string>", "The signer's seed", "//Alice")
  .option(
    "--endpoint <string>",
    "The endpoint URL of the API connection",
    "wss://bp-rpc.zeitgeist.pm"
  )
  .action(
    (
      title: string,
      description: string,
      oracle: string,
      end: string,
      opts: {
        endpoint: string;
        seed: string;
        categories: string[];
        advised: boolean;
      }
    ) =>
      catchErrorsAndExit(
        createMarket,
        Object.assign(opts, { title, description, oracle, end })
      )
  );

program
  .command("viewMarket <marketId>")
  .option(
    "--address <string>",
    "An address on which to report ownership of shares."
  )
  .option(
    "--seed <string>",
    "A seed from which to calculate an address on which to report ownership of shares",
    "//Alice"
  )
  .option(
    "--endpoint <string>",
    "The endpoint URL of the API connection",
    "wss://bp-rpc.zeitgeist.pm"
  )
  .action((marketId: number, opts: any) =>
    catchErrorsAndExit(viewMarket, Object.assign(opts, { marketId }))
  );

program
  .command("cancelMarket <marketId>")
  .option("--seed <string>", "The signer's seed", "//Alice")
  .option(
    "--endpoint <string>",
    "The endpoint URL of the API connection",
    "wss://bp-rpc.zeitgeist.pm"
  )
  .action((marketId: number, opts: any) =>
    catchErrorsAndExit(cancelPendingMarket, Object.assign(opts, { marketId }))
  );

program
  .command("viewSwap <marketId>")
  .option(
    "--endpoint <string>",
    "The endpoint URL of the API connection",
    "wss://bp-rpc.zeitgeist.pm"
  )
  .action((marketId: number, opts: any) =>
    catchErrorsAndExit(viewSwap, Object.assign(opts, { marketId }))
  );

program
  .command("buyCompleteSet <marketId> <amount>")
  .option("--seed <string>", "The signer's seed", "//Alice")
  .option(
    "--endpoint <string>",
    "The endpoint URL of the API connection",
    "wss://bp-rpc.zeitgeist.pm"
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
    "wss://bp-rpc.zeitgeist.pm"
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
    "wss://bp-rpc.zeitgeist.pm"
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
    "wss://bp-rpc.zeitgeist.pm"
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
    "wss://bp-rpc.zeitgeist.pm"
  )
  .action((marketId: number, opts: { seed: string }) =>
    catchErrorsAndExit(redeemShares, Object.assign(opts, { marketId }))
  );

program
  .command("deployPool <marketId>")
  .option("--seed <string>", "The signer's seed", "//Alice")
  .option(
    "--endpoint <string>",
    "The endpoint URL of the API connection",
    "wss://bp-rpc.zeitgeist.pm"
  )
  .option(
    "--weights <weights>",
    "A comma-separated list of lengths for each asset",
    ""
  )
  .action((marketId: number, opts: { endpoint: string; seed: string }) =>
    catchErrorsAndExit(deployPool, Object.assign(opts, { marketId }))
  );

program
  .command("joinPool <poolId> <amountOut> <amountIn>")
  .option("--seed <string>", "The signer's seed", "//Alice")
  .option(
    "--endpoint <string>",
    "The endpoint URL of the API connection",
    "wss://bp-rpc.zeitgeist.pm"
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
  .command("exitPool <poolId> <amountIn> <amountOut>")
  .option("--seed <string>", "The signer's seed", "//Alice")
  .option(
    "--endpoint <string>",
    "The endpoint URL of the API connection",
    "wss://bp-rpc.zeitgeist.pm"
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
  .command(
    "swapExactAmountIn <poolId> <assetIn> <assetAmountIn> <assetOut> <minAmountOut> <maxPrice>"
  )
  .option("--seed <string>", "The signer's seed", "//Alice")
  .option(
    "--endpoint <string>",
    "The endpoint URL of the API connection",
    "wss://bp-rpc.zeitgeist.pm"
  )
  .action(
    (
      poolId: number,
      assetIn: string,
      assetAmountIn: string,
      assetOut: string,
      minAmountOut: string,
      maxPrice: string,
      opts: { seed: string; endpoint: string }
    ) =>
      catchErrorsAndExit(
        swapExactAmountIn,
        Object.assign(opts, {
          assetIn,
          assetAmountIn,
          assetOut,
          minAmountOut,
          maxPrice,
          poolId,
        })
      )
  );

program
  .command(
    "swapExactAmountOut <poolId> <assetIn> <maxAmountIn> <assetOut> <assetAmountOut> <maxPrice>"
  )
  .option("--seed <string>", "The signer's seed", "//Alice")
  .option(
    "--endpoint <string>",
    "The endpoint URL of the API connection",
    "wss://bp-rpc.zeitgeist.pm"
  )
  .action(
    (
      poolId: number,
      assetIn: string,
      maxAmountIn: string,
      assetOut: string,
      assetAmountOut: string,
      maxPrice: string,
      opts: { seed: string; endpoint: string }
    ) =>
      catchErrorsAndExit(
        swapExactAmountOut,
        Object.assign(opts, {
          assetIn,
          maxAmountIn,
          assetOut,
          assetAmountOut,
          maxPrice,
          poolId,
        })
      )
  );

program
  .command("getBalance <addressOrSeed>, <asset>")
  .option(
    "--endpoint <string>",
    "The endpoint URL of the API connection",
    "wss://bp-rpc.zeitgeist.pm"
  )
  .action((addressOrSeed = "//Alice", asset, opts: { endpoint: string }) =>
    catchErrorsAndExit(
      getShareBalance,
      Object.assign(opts, { addressOrSeed, asset })
    )
  );

program
  .command("getSpotPrice <poolId> <assetIn> <assetOut>")
  .option(
    "--endpoint <string>",
    "The endpoint URL of the API connection",
    "wss://bp-rpc.zeitgeist.pm"
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
  .command("wrapNativeCurrency <amount>")
  .option("--seed <string>", "The signer's seed", "//Alice")
  .option(
    "--endpoint <string>",
    "The endpoint URL of the API connection",
    "wss://bp-rpc.zeitgeist.pm"
  )
  .action((amount: string, opts: { endpoint: string; seed: string }) =>
    catchErrorsAndExit(wrapNativeCurrency, Object.assign(opts, { amount }))
  );

program
  .command("getAssetsPrices <blockNumber>")
  .option(
    "--endpoint <string>",
    "The endpoint URL of the API connection",
    "wss://bp-rpc.zeitgeist.pm"
  )
  .action((blockNumber: string, opts: { endpoint: string }) =>
    catchErrorsAndExit(getAssetsPrices, Object.assign(opts, { blockNumber }))
  );

program
  .command("transfer <marketId> <sharesIndex> <to> <amount>")
  .option("--seed <string>", "The signer's seed", "//Alice")
  .option(
    "--endpoint <string>",
    "The endpoint URL of the API connection",
    "wss://bp-rpc.zeitgeist.pm"
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
  .command("countMarkets")
  .option(
    "--endpoint <string>",
    "The endpoint URL of the API connection",
    "wss://bp-rpc.zeitgeist.pm"
  )
  .action((opts: { endpoint: string }) =>
    catchErrorsAndExit(countMarkets, Object.assign(opts))
  );

program
  .command("getAllMarketIds")
  .option(
    "--endpoint <string>",
    "The endpoint URL of the API connection",
    "wss://bp-rpc.zeitgeist.pm"
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
    "wss://bp-rpc.zeitgeist.pm"
  )
  .action((opts: { endpoint: string; filter: string[] }) =>
    catchErrorsAndExit(getAllMarkets, Object.assign(opts))
  );

program
  .command("approveMarket <marketId>")
  .option(
    "--endpoint <string>",
    "The endpoint URL of the API connection",
    "wss://bp-rpc.zeitgeist.pm"
  )
  .option(
    "--seed <string>",
    "The signer's seed. Must be an ApprovalOrigin",
    "//Alice"
  )
  .action((marketId: number, opts: any) =>
    catchErrorsAndExit(approveMarket, Object.assign(opts, { marketId }))
  );

program
  .command("rejectMarket <marketId>")
  .option(
    "--endpoint <string>",
    "The endpoint URL of the API connection",
    "wss://bp-rpc.zeitgeist.pm"
  )
  .option(
    "--seed <string>",
    "The signer's seed. Must be an ApprovalOrigin",
    "//Alice"
  )
  .action((marketId: number, opts: any) =>
    catchErrorsAndExit(rejectMarket, Object.assign(opts, { marketId }))
  );

program
  .command("viewDisputes <marketId>")
  .option(
    "--endpoint <string>",
    "The endpoint URL of the API connection",
    "wss://bp-rpc.zeitgeist.pm"
  )
  .action((marketId: number, opts: { endpoint: string }) =>
    catchErrorsAndExit(viewDisputes, Object.assign(opts, { marketId }))
  );

program.parse(process.argv);
