import { hexToString, u8aToString } from "@polkadot/util";
import CID from "cids";
import all from "it-all";
import { concat, toString } from "uint8arrays";
import { initIpfs } from "../util";

export default class IPFS {
  private client: any;

  constructor() {
    this.client = initIpfs();
  }

  async add(content: string, hashAlg = "sha3-384"): Promise<CID> {
    const { cid } = await this.client.add({ content }, { hashAlg });
    return cid;
  }

  /**
   * Reads data from a given partial CID.
   * @param partialCid A partial CID without the encoding prefix.
   * @returns A promise that resolves to the data at the CID.
   */
  async read(partialCid: string): Promise<string> {
    // Old way - backwards compatibility is fun
    if (partialCid.slice(2, 6) !== "1530") {
      const str = hexToString(partialCid);
      return toString(concat(await all(this.client.cat(str))));
    }

    // New way
    const cid = new CID("f0155" + partialCid.slice(2));
    const data = await all(this.client.cat(cid));

    return data.map(u8aToString).reduce((p, c) => p + c);
  }
}
