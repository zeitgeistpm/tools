import { hexToString } from "@polkadot/util";
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

  async read(what: string): Promise<string> {
    // Old way - backwards compatibility is fun
    if (what.slice(2, 6) !== "1530") {
      const str = hexToString(what);
      return toString(concat(await all(this.client.cat(str))));
    }

    // New way
    const cid = new CID("f0155" + what.slice(2));
    const encoded = cid.toString("base32");
    const data = await all(this.client.cat(encoded));

    return data.toString();
  }
}

/// The Ghetto Test Suite ^TM
// const Tests = async () => {
//   const ipfs = new IPFS();
//   const cid = await ipfs.add("some");
//   console.log(u8aToHex(cid.multihash));
//   const c = "0x" + cid.toString("base16").slice(5);
//   console.log("CID", c);
//   const res = await ipfs.read(c);
//   console.log("res", res);
// };

// try {
//   Tests();
// } catch (e) {
//   console.error(e);
// }
