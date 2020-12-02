import { ApiPromise } from "@polkadot/api";
import { KeyringPair } from "@polkadot/keyring/types";
import { initIpfs } from "../util";

import Market from "./market";
import Shares from "./shares";

export { Market, Shares };

export default class Models {
  private api: ApiPromise;

  constructor(api: ApiPromise) {
    this.api = api;
  }

  /**
   * Creates a new market with the given parameters.
   * @param signer The signer who will send the transaction.
   * @param title The title of the new prediction market.
   * @param description The description / extra information for the market.
   * @param oracle The address that will be responsible for reporting the market.
   * @param creationType "Permissionless" or "Advised"
   */
  async createNewMarket(
    signer: KeyringPair,
    title: string,
    description: string,
    oracle: string,
    creationType = "Permissionless"
  ): Promise<string> {
    const ipfs = initIpfs();

    const { cid } = await ipfs.add({
      content: `title:${title}::info:${description}`,
    });

    return new Promise(async (resolve) => {
      const unsub = await this.api.tx.predictionMarkets
        .create(oracle, "Binary", 500000, cid.toString(), creationType)
        .signAndSend(signer, (result) => {
          const { events, status } = result;

          if (status.isInBlock) {
            console.log(
              `Transaction included at blockHash ${status.asInBlock}`
            );

            events.forEach(({ phase, event: { data, method, section } }) => {
              console.log(`\t' ${phase}: ${section}.${method}:: ${data}`);

              if (method == "MarketCreated") {
                resolve(data[0].toString());
              }
            });

            unsub();
          }
        });
    });
  }
}
