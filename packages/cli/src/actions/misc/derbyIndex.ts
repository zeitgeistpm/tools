import SDK from "@zeitgeistpm/sdk";
import fs from "fs";
import { Asset } from "../../../../types/dist/interfaces";
import { encodeAddress } from "@polkadot/util-crypto";

/**
 * Rewards are determined by the following participations:
 * 1) Getting a token from the faucet - 0.1 points
 * 2) Placing a trade on the markets - 1 points
 * 3) Predicting the correct winner - 5 points
 * 4) Ending balance - MIN(10, bal * 0.01) points
 */

const FAUCET_ADDRESS = "5EeeZVU4SiPG6ZRY7o8aDcav2p2mZMdu3ZLzbREWuHktYdhX";
const DERBY_MARKETS = [14, 15, 16];

// Methods to search for
const METHODS = ["balances", "swaps"];

// Store for the points for any address
const Store: Map<string, number> = new Map();

const addPoints = (address: string, points: number): boolean => {
  console.log(`Adding ${points} to ${address}`);

  if (Store.has(address)) {
    const oldVal = Store.get(address);
    Store.set(address, oldVal + points);
  } else {
    Store.set(address, points);
  }

  return true;
};

/**
 * Indexes the derby participation, and assigns points to participants
 * based on how they participated.
 */
const derbyIndex = async () => {
  const sdk = await SDK.initialize("wss://bp-rpc.zeitgeist.pm");

  // const currentHeader = await sdk.api.rpc.chain.getHeader();
  // const headBlock = await sdk.api.rpc.chain.getBlock(currentHeader.hash);

  // let curBlock = headBlock;
  // while (curBlock.block.header.number.toNumber() > 0) {
  //   const { block } = curBlock;
  //   const { header, extrinsics } = block;

  //   console.log("Current block", block.header.number.toNumber());

  //   for (const extrinsic of extrinsics) {
  //     const { method, signer } = extrinsic;
  //     const { method: exMethod, section, args } = method;
  //     if (!!METHODS.find((x) => x === section)) {
  //       // Track faucet hits
  //       if (section === "balances") {
  //         if (exMethod === "transfer") {
  //           if (signer.toString() === FAUCET_ADDRESS) {
  //             const [dest] = args;
  //             addPoints(dest.toString(), 0.1);
  //           }
  //         }
  //       }

  //       // Track trades to a position
  //       if (section === "swaps") {
  //         if (exMethod === "swapExactAmountIn") {
  //           const [, , , assetOut] = args;
  //           if ((assetOut as Asset).isCategoricalOutcome) {
  //             const [marketId] = (assetOut as Asset).asCategoricalOutcome;
  //             if (DERBY_MARKETS.indexOf(marketId.toNumber()) !== -1) {
  //               addPoints(signer.toString(), 1);
  //             }
  //           }
  //         }
  //       }
  //     }
  //   }

  //   curBlock = await sdk.api.rpc.chain.getBlock(header.parentHash);
  // }

  // Get all balances
  const getAllBalances = async () => {
    const allKeys = await sdk.api.query.system.account.keys();
    const balances = await Promise.all(
      allKeys.map(async (key) => {
        // console.log(key.toString());
        const pubkey = key.toString().slice(-64);
        console.log(pubkey);
        const address = encodeAddress("0x" + pubkey);
        console.log(address.toString());
        const data = await sdk.api.query.system.account(address);
        // console.log(data.nonce.toString());
        return [address.toString(), data.data.free.toString()];
      })
    );

    for (const entry of balances) {
      const points = Math.min(10, (Number(entry[1]) * 0.01) / 10 ** 10);
      addPoints(entry[0], points);
    }
  };

  await getAllBalances();
};

try {
  derbyIndex();
} catch (err) {
  console.error(err);
}
