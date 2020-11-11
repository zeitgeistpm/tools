import program from "commander";

import createMarket from "./actions/createMarket";
import viewMarket from "./actions/viewMarket";

program
  .command("createMarket")
  .option("--endpoint <string>", "The endpoint to connect the API to.", "wss://bp-rpc.zeitgeist.pm")
  .option("--title <string>", "Title of the prediction market.", "")
  .option("--info <string>", "Additional infomation about the prediction market.", "")
  .option("--oracle <string>", "The designated oracle to resolve the prediction market.", "")
  .option("--seed <string>", "The signer's seed. Default is `//Alice`.", "0xe5be9a5092b81bca64be81d212e7f2f9eba183bb7a90954f7b76361f6edb5c0a")
  .action(createMarket);

program
  .command("viewMarket")
  .option("--endpoint <string>", "The endpoint to connect the API to.", "wss://bp-rpc.zeitgeist.pm")
  .option("--marketId <index>", "The index of the market to view.", "0")
  .action(viewMarket);

program.parse(process.argv);
