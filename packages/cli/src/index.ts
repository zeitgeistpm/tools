import program from "commander";

import buyCompleteSet from "./actions/buyCompleteSet";
import createMarket from "./actions/createMarket";
import disputeMarket from './actions/disputeMarket';
import reportMarket from './actions/reportMarket';
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
    "--endpoint <string>",
    "The endpoint to connect the API to.",
    "wss://bp-rpc.zeitgeist.pm"
  )
  .option(
    "--seed <string>",
    "The signer's seed. Default is `//Alice`.",
    "clean useful exotic shoe day rural hotel pitch manual happy inherit concert"
  )
  .action(
    (
      title: string,
      description: string,
      oracle: string,
      end: string,
      opts: { endpoint: string; seed: string }
    ) =>
      catchErrorsAndExit(
        createMarket,
        Object.assign(opts, { title, description, oracle, end })
      )
  );

program
  .command("viewMarket <marketId>")
  .option(
    "--endpoint <string>",
    "The endpoint to connect the API to.",
    "wss://bp-rpc.zeitgeist.pm"
  )
  .action((marketId: number, opts: any) =>
    catchErrorsAndExit(viewMarket, Object.assign(opts, { marketId }))
  );

program
  .command("viewSwap <marketId>")
  .option(
    "--endpoint <string>",
    "The endpoint to connect the API to.",
    "wss://bp-rpc.zeitgeist.pm"
  )
  .action((marketId: number, opts: any) =>
    catchErrorsAndExit(viewSwap, Object.assign(opts, { marketId }))
  );

program
  .command("buyCompleteSet <marketId> <amount>")
  .option(
    "--endpoint <string>",
    "The endpoint to connect the API to.",
    "wss://bp-rpc.zeitgeist.pm"
  )
  .option(
    "--seed <string>",
    "The signer's seed. Default is `//Alice`.",
    "clean useful exotic shoe day rural hotel pitch manual happy inherit concert"
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
  .option(
    "--seed <string>",
    "The signer's seed. Default is `//Alice`.",
    "clean useful exotic shoe day rural hotel pitch manual happy inherit concert"
  )
  .action((marketId: number, amount: number, opts: { seed: string }) =>
    catchErrorsAndExit(
      sellCompleteSet,
      Object.assign(opts, { marketId, amount })
    )
  );

program
  .command("report <marketId> <outcome>")
  .option(
    "--seed <string>",
    "The signer's seed. Default is `//Alice`.",
    "clean useful exotic shoe day rural hotel pitch manual happy inherit concert"
  )
  .action((marketId: number, outcome: number, opts: { seed: string }) =>
    catchErrorsAndExit(
      reportMarket,
      Object.assign(opts, { marketId, outcome })
    )
  );


program
  .command("dispute <marketId> <outcome>")
  .option(
    "--seed <string>",
    "The signer's seed. Default is `//Alice`.",
    "clean useful exotic shoe day rural hotel pitch manual happy inherit concert"
  )
  .action((marketId: number, outcome: number, opts: { seed: string }) =>
    catchErrorsAndExit(
      disputeMarket,
      Object.assign(opts, { marketId, outcome })
    )
  );

program
  .command("redeem <marketId>")
  .option(
    "--seed <string>",
    "The signer's seed. Default is `//Alice`.",
    "clean useful exotic shoe day rural hotel pitch manual happy inherit concert"
  )
  .action((marketId: number, opts: { seed: string }) =>
    catchErrorsAndExit(
      redeemShares,
      Object.assign(opts, { marketId })
    )
  );

program
  .command("deployPool <marketId>")
  .option(
    "--endpoint <string>",
    "The endpoint to connect the API to.",
    "wss://bp-rpc.zeitgeist.pm"
  )
  .option(
    "--seed <string>",
    "The signer's seed. Default is `//Alice`.",
    "clean useful exotic shoe day rural hotel pitch manual happy inherit concert"
  )
  .action((marketId: number, opts: { endpoint: string; seed: string }) =>
    catchErrorsAndExit(deployPool, Object.assign(opts, { marketId }))
  );

program
  .command("joinPool <poolId> <amountOut> <amountIn>")
  .option(
    "--endpoint <string>",
    "The endpoint to connect the API to.",
    "wss://bp-rpc.zeitgeist.pm"
  )
  .option(
    "--seed <string>",
    "The signer's seed. Default is `//Alice`.",
    "clean useful exotic shoe day rural hotel pitch manual happy inherit concert"
  )
  .action(
    (
      poolId: number,
      amountOut: string,
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
  .option(
    "--endpoint <string>",
    "The endpoint to connect the API to.",
    "wss://bp-rpc.zeitgeist.pm"
  )
  .option(
    "--seed <string>",
    "The signer's seed. Default is `//Alice`.",
    "clean useful exotic shoe day rural hotel pitch manual happy inherit concert"
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
  .option(
    "--endpoint <string>",
    "The endpoint to connect the API to.",
    "wss://bp-rpc.zeitgeist.pm"
  )
  .option(
    "--seed <string>",
    "The signer's seed. Default is `//Alice`.",
    "clean useful exotic shoe day rural hotel pitch manual happy inherit concert"
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
  .option(
    "--endpoint <string>",
    "The endpoint to connect the API to.",
    "wss://bp-rpc.zeitgeist.pm"
  )
  .option(
    "--seed <string>",
    "The signer's seed. Default is `//Alice`.",
    "clean useful exotic shoe day rural hotel pitch manual happy inherit concert"
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
  .command("shareBalance <marketId> <shareIndex> <account>")
  .option(
    "--endpoint <string>",
    "The endpoint to connect the API to.",
    "wss://bp-rpc.zeitgeist.pm"
  )
  .action((marketId: number, shareIndex: number, account: string) =>
    catchErrorsAndExit(getShareBalance, { marketId, shareIndex, account })
  );

program
  .command("getSpotPrice <poolId> <assetIn> <assetOut>")
  .option(
    "--endpoint <string>",
    "The endpoint to connect the API to.",
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
  .option(
    "--endpoint <string>",
    "The endpoint to connect the API to.",
    "wss://bp-rpc.zeitgeist.pm"
  )
  .option(
    "--seed <string>",
    "The signer's seed. Default is `//Alice`.",
    "clean useful exotic shoe day rural hotel pitch manual happy inherit concert"
  )
  .action((amount: string, opts: { endpoint: string; seed: string }) =>
    catchErrorsAndExit(wrapNativeCurrency, Object.assign(opts, { amount }))
  );

program
  .command("transfer <marketId> <sharesIndex> <to> <amount>")
  .option(
    "--endpoint <string>",
    "The endpoint to connect the API to.",
    "wss://bp-rpc.zeitgeist.pm"
  )
  .option(
    "--seed <string>",
    "The signer's seed. Default is `//Alice`.",
    "clean useful exotic shoe day rural hotel pitch manual happy inherit concert"
  )
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

program.parse(process.argv);
