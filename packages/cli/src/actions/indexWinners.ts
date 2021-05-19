import fs from "fs";
import SDK, { util } from "@zeitgeistpm/sdk";
import { hexToBn, isHex } from "@polkadot/util";

type Options = {
  marketId?: number;
  startBlock?: number;
  endBlock?: number;
  outFile?: string;
  displayHashes?: boolean;
  endpoint: string;
};

const successfulTransfers = {};
const promiseQueue = [];

const indexableExtrinsics = [
  "balances::transfer",
  "balances::transferKeepAlive",
  // not implemented V
  // "currency::transfer",
  // "currency::transferNativeCurrency",
];

const arbitrarySet = null;

const assets = [`{"ztg":"null"}`];

const spotPrice = {
  '{"ztg":"null"}': 1,
};

const indexExtrinsicsUnstable = async (opts: Options): Promise<void> => {
  console.log("options:", opts);

  const {
    marketId,
    startBlock,
    endBlock,
    outFile,
    displayHashes,
    endpoint,
  } = opts;

  if (outFile) {
    fs.promises
      .access(outFile, fs.constants.W_OK)
      .then(() => {
        console.log(`WARNING! ${outFile} exists and will be overwritten.`);
      })
      .catch((err) => {
        if (err.code !== "ENOENT") {
          throw err;
        }
      });
  }

  // eslint-disable-next-line
  let timer= Date.now();

  const sdk = await SDK.initialize(endpoint);
  console.log("Begin at ", Date.now());

  const outcomeAssets =
    marketId === undefined
      ? []
      : sdk.models.fetchMarketData(Number(marketId)).then((marketData) => {
          if (marketData.report === null) {
            throw new Error(
              `Market ${marketId} exists, with marketStatus ${marketData.marketStatus} but is not reported.`
            );
          }
          console.log(marketData.outcomeAssets);
          // TODO: check report status matches for non-categorical outcomes
          marketData.outcomeAssets.forEach((asset, idx) => {
            spotPrice[JSON.stringify(asset)] = Number(
              Number(marketData.report) === idx
            );
          });
          return marketData.outcomeAssets;
        });

  let latestBlock = 0;
  if (!endBlock) {
    const head = await sdk.api.rpc.chain.getHeader();
    latestBlock = head.number.toNumber();
  }

  const blockHash = await sdk.api.rpc.chain.getBlockHash(
    Number(endBlock) || latestBlock
  );
  console.log("blockHash received at ", Date.now());
  console.log("blockHash", blockHash.toString());

  const res = await sdk.models.indexTransferRecipients(
    startBlock || 0,
    endBlock,
    arbitrarySet
  );

  // timer = Date.now();
  console.log("beginning postprocessing at:", timer);

  try {
    const isNotInvalid = async (extrinsic, methodConcatName, wholeBlock) => {
      const { blockNum } = extrinsic;
      console.log(`check if ${methodConcatName} extrinsic is invalid`);

      if (methodConcatName.startsWith("balances::transfer")) {
        console.log("extrinsic.toHuman()", extrinsic.toHuman());

        let hash;
        try {
          hash = await sdk.api.rpc.chain.getBlockHash(blockNum);
          if (displayHashes) {
            console.log(blockNum, "hash", hash.toHuman());
          }
        } catch (e) {
          console.log(
            `Error calling getBlockHash. Block: ${blockNum}, hash: ${hash.toHuman()}`
          );
          throw e;
        }

        const events = await await sdk.api.query.system.events.at(hash);
        const methods = events
          //@ts-ignore
          .filter((event) => event.toJSON().phase.applyExtrinsic > 0)
          .map((event) => `${event.event.section}::${event.event.method}`);

        console.log(blockNum, "event methods are", methods);

        if (
          methods.includes("system::ExtrinsicSuccess") &&
          methods.includes("balances::Transfer")
        ) {
          return true;
        } else if (methods.includes("system::ExtrinsicFailed")) {
          return false;
        } else if (methods.includes("system::ExtrinsicSuccess")) {
          console.log(
            `Expected balances::Transfer event or failure after extrinsic ${methodConcatName} called in block ${blockNum}. This must mean that somebody transferred to themselves.`
          );
        } else {
          throw new Error(
            `Hanging extrinsic: ${methodConcatName} called in block ${blockNum} did not result in either system::ExtrinsicFailed or system::ExtrinsicSuccess wtihin the same block. This should never happen.`
          );
        }
      }
      console.log(
        `Don't know how to check the validity of ${methodConcatName}`
      );
      // Unhandled case - do not return true/false;
      return;
    };

    const indexSelectedExtrinsic = (args, methodConcatName, wholeBlock) => {
      if (methodConcatName.startsWith("balances::transfer")) {
        // Note different capitalisation: .toHuman().args[x].id  vs. args[0].toHuman().Id)
        const recipient = args[0].toHuman().Id;
        const balance = Number(args[1]);
        if (isNaN(balance)) {
          console.log(
            "Expected balance as second argument, got:",
            args,
            "of which second argument converts to",
            Number(args[1])
          );
          throw new Error(
            `${args[1]} did not converts to a numerical balance in ${wholeBlock.blockNum}- ${methodConcatName}`
          );
        }

        if (!successfulTransfers[recipient]) {
          successfulTransfers[recipient] = {};
        }
        console.log(`${balance}->${recipient}`);

        const asset = `{"ztg":"null"}`;
        if (!successfulTransfers[recipient][asset]) {
          successfulTransfers[recipient][asset] = 0;
        }

        successfulTransfers[recipient][asset] += balance;
        return [balance, asset, recipient];
      }
    };

    //@ts-ignore
    const parseExtrinsics = (singleExtrinsic, idx, _blockExtrinsics) => {
      const toHuman = singleExtrinsic.method.toHuman();
      const methodConcatName = `${toHuman.section}::${toHuman.method}`;

      if (methodConcatName === "timestamp::set") {
        console.log(
          `\n${singleExtrinsic.blockNum}-${idx}: methodConcatName=${methodConcatName}, ignore.`
        );
        return false;
      }
      console.log(`${singleExtrinsic.blockNum}-${idx}: ${methodConcatName}`);

      let checkedValid = null;
      if (indexableExtrinsics.includes(methodConcatName)) {
        promiseQueue.push(
          new Promise(async (resolve, _) => {
            checkedValid = await isNotInvalid(
              singleExtrinsic,
              methodConcatName,
              _blockExtrinsics
            );
            console.log(
              `${singleExtrinsic.blockNum}${
                checkedValid ? " contains a valid transfer." : ": No transfers."
              }`
            );
            if (checkedValid) {
              indexSelectedExtrinsic(
                singleExtrinsic.args,
                methodConcatName,
                _blockExtrinsics
              );
            }
            resolve(null);
          })
        );
      }

      return { methodConcatName };
    };

    console.log("\n");
    console.log("res:", res);

    console.log("\n");
    const filteredBlocks = res
      .map((blockExtrinsics) => {
        if (blockExtrinsics.length != 1 || blockExtrinsics[0].length !== 10) {
          if (!Array.isArray(blockExtrinsics)) {
            console.log(
              `blockExtrinsics: (${typeof blockExtrinsics})`,
              blockExtrinsics
            );
            console.log(`response length: ${res.length}`);
            throw new Error("SDK returned malformed data");
          }

          return {
            // @ts-ignore
            blockNum: blockExtrinsics.blockNum,
            extrinsics: blockExtrinsics,
            filteredExtrinsics: blockExtrinsics
              .map((singleExtrinsic) =>
                Object.assign(singleExtrinsic, {
                  // @ts-ignore
                  blockNum: blockExtrinsics.blockNum,
                })
              )
              .filter(parseExtrinsics),
          };
        }
      })
      .filter((block) => block && block.filteredExtrinsics.length);

    console.log("blocks filtered at:", Date.now());
    console.log(successfulTransfers);
  } catch (e) {
    console.log("Failure in CLI function indexExtrinsicsUnstable.");
    console.log(e);
  }

  await Promise.all(promiseQueue);
  const balancesChange = await Promise.all(
    Object.keys(successfulTransfers).map(async (player) => {
      const change = { player };

      const responses = assets.map(async (asset) =>
        asset === `{"ztg":"null"}`
          ? await sdk.api.query.system.account(player).then((res) => res.data)
          : await sdk.api.query.tokens.accounts(player, asset)
      );

      await Promise.all(assets);
      (await Promise.all(responses)).forEach((newBalance, idx) => {
        change[assets[idx]] =
          // @ts-ignore
          (newBalance.toJSON().free || 0) -
          successfulTransfers[player][assets[idx] || 0] +
          0;
      });

      return change;
    })
  );

  console.log("balancesChange", balancesChange);

  const profit = Object.keys(successfulTransfers)
    .map((player, idx) => ({
      ...successfulTransfers[player],
      player,
      profit: assets.reduce(
        (total, asset) => total + balancesChange[idx][asset] * spotPrice[asset],
        0
      ),
    }))
    .sort((a, b) => b.profit - a.profit);

  console.log(
    `completed at: ${Date.now()}: ${(Date.now() - timer) / 1000}s.\n`
  );

  // @ts-ignore
  const lock = new Promise((resolve, reject) => {
    let csvStream;
    if (outFile) {
      csvStream = fs.createWriteStream(outFile);
      csvStream.write(
        `"Player","ZTG received","Balances ZTG value","Profit"\n`
      );
      csvStream.on("finish", resolve);
    } else {
      resolve("No file output to await :)");
    }

    profit.forEach((player, idx) => {
      console.log(`\nPLACED: ${idx + 1}...`);
      if (player.profit) {
        console.log(
          `with total ${player.profit > 0 ? "WINNINGS" : "LOSSES"} of ${
            player.profit / 1e10
          } ZTG -`
        );
      } else {
        console.log(`(BROKE EVEN)`);
      }
      console.log(`${player.player}`);

      if (outFile) {
        csvStream.write(
          `${player.player},${player[`{"ztg":"null"}`] / 1e10},${
            player.profit / 1e10
          }\n`
        );
      }
    });

    csvStream.end();
  });

  await lock;
};

export default indexExtrinsicsUnstable;
