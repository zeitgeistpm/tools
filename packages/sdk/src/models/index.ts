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

  async createNewMarket(
    signer: KeyringPair,
    title: string,
    description: string,
    oracle: string,
    creationType = "Permissionless"
  ): Promise<any> {
    const ipfs = initIpfs();

    const { cid } = await ipfs.add({
      content: `title:${title}::info:${description}`,
    });

    const unsub = await this.api.tx.predictionMarkets
      .create(oracle, "Binary", 500000, cid.toString(), creationType)
      .signAndSend(signer, (result) => {
        const { events, status } = result;

        if (status.isInBlock) {
          console.log(`Transaction included at blockHash ${status.asInBlock}`);

          events.forEach(({ phase, event: { data, method, section } }) => {
            console.log(`\t' ${phase}: ${section}.${method}:: ${data}`);
          });

          unsub();
          return;
        }
      });
  }
}
