import program from "commander";

import createMarket from "./actions/createMarket";
import viewMarket from "./actions/viewMarket";
import buyCompleteSet from "./actions/buyCompleteSet";
import sellCompleteSet from "./actions/sellCompleteSet";
import getShareBalance from "./actions/getShareBalance";

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
  .command("createMarket")
  .option(
    "--endpoint <string>",
    "The endpoint to connect the API to.",
    "wss://bp-rpc.zeitgeist.pm"
  )
  .option("--title <string>", "Title of the prediction market.", "")
  .option(
    "--info <string>",
    "Additional infomation about the prediction market.",
    ""
  )
  .option(
    "--oracle <string>",
    "The designated oracle to resolve the prediction market.",
    ""
  )
  .option(
    "--seed <string>",
    "The signer's seed. Default is `//Alice`.",
    "0xe5be9a5092b81bca64be81d212e7f2f9eba183bb7a90954f7b76361f6edb5c0a"
  )
  .action(createMarket);

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
  .command("buyCompleteSet <marketId> <amount>")
  .option(
    "--seed <string>",
    "The signer's seed. Default is `//Alice`.",
    "0xe5be9a5092b81bca64be81d212e7f2f9eba183bb7a90954f7b76361f6edb5c0a"
  )
  .action((marketId: number, amount: number, opts: { seed: string }) =>
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
  .command("shareBalance <marketId> <shareIndex> <account>")
  .action((marketId: number, shareIndex: number, account: string) =>
    catchErrorsAndExit(getShareBalance, { marketId, shareIndex, account })
  );

program.parse(process.argv);
