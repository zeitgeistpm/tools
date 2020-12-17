import program from "commander";

import buyCompleteSet from "./actions/buyCompleteSet";
import createMarket from "./actions/createMarket";
import deployPool from "./actions/deployPool";
import viewMarket from "./actions/viewMarket";
import viewSwap from "./actions/viewSwap";
import sellCompleteSet from "./actions/sellCompleteSet";
import getShareBalance from "./actions/getShareBalance";
import wrapNativeCurrency from "./actions/wrapNativeCurrency";

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
    "0xe5be9a5092b81bca64be81d212e7f2f9eba183bb7a90954f7b76361f6edb5c0a"
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
  .command("viewSwap <marketId")
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
    "0xe5be9a5092b81bca64be81d212e7f2f9eba183bb7a90954f7b76361f6edb5c0a"
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
    "0xe5be9a5092b81bca64be81d212e7f2f9eba183bb7a90954f7b76361f6edb5c0a"
  )
  .action((marketId: number, amount: number, opts: { seed: string }) =>
    catchErrorsAndExit(
      sellCompleteSet,
      Object.assign(opts, { marketId, amount })
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
    "0xe5be9a5092b81bca64be81d212e7f2f9eba183bb7a90954f7b76361f6edb5c0a"
  )
  .action((marketId: number, opts: { endpoint: string; seed: string }) =>
    catchErrorsAndExit(deployPool, Object.assign(opts, { marketId }))
  );

program
  .command("shareBalance <marketId> <shareIndex> <account>")
  .action((marketId: number, shareIndex: number, account: string) =>
    catchErrorsAndExit(getShareBalance, { marketId, shareIndex, account })
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
    "0xe5be9a5092b81bca64be81d212e7f2f9eba183bb7a90954f7b76361f6edb5c0a"
  )
  .action((amount: string, opts: { endpoint: string; seed: string }) =>
    catchErrorsAndExit(wrapNativeCurrency, Object.assign(opts, { amount }))
  );

program.parse(process.argv);
