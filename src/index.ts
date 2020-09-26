import program from "commander";

import createMarket from "./actions/createMarket";
import viewMarket from "./actions/viewMarket";

program
  .command("createMarket")
  .option("--title <string>", "Title of the prediction market.", "")
  .option("--info <string>", "Additional infomation about the prediction market.", "")
  .option("--oracle <string>", "The designated oracle to resolve the prediction market.", "")
  .option("--seed <string>", "The signer's seed.", "")
  .action(createMarket);

program
  .command("viewMarket")
  .option("--marketId <index>", "The index of the market to view.", "0")
  .action(viewMarket);

program.parse(process.argv);
