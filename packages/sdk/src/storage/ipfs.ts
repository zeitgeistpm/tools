import { hexToString, u8aToString } from "@polkadot/util";
import CID from "cids";
import all from "it-all";
import { concat, toString } from "uint8arrays";
import ipfsClient from "ipfs-http-client";
import axios from "axios";

export default class IPFS {
  private client: ReturnType<typeof ipfsClient>;
  private pinToCluster: boolean;

  constructor(ipfsClientUrl = `https://ipfs.zeitgeist.pm`) {
    this.client = ipfsClient({ url: ipfsClientUrl });

    if (ipfsClientUrl == `https://ipfs.zeitgeist.pm`) {
      this.pinToCluster = true;
    } else {
      this.pinToCluster = false;
    }
  }

  async add(content: string): Promise<CID> {
    let ipfsClientCid;
    try {
      ipfsClientCid = (
        await this.client.add(content, {
          hashAlg: `sha3-384`,
        })
      ).cid;
    } catch (e) {
      throw new Error(
        `Failed to publish content to provided IPFS gateway, ${e}`
      );
    }

    if (this.pinToCluster) {
      try {
        const res = await this.pinCidToCluster(ipfsClientCid.toString());
        if (res) {
          console.log(
            `\x1b[36m%s\x1b[0m`,
            `\nData published on ${res.allocations.length} cluster peers.\n`
          );
        } else {
          console.log(
            `\x1b[31m%s\x1b[0m`,
            `\nFailed to publish data on cluster\n`
          );
        }
      } catch (e) {
        console.log(`Failed to publish data on cluster\n ${e}\n`);
      }
    }
    return ipfsClientCid;
  }

  async pinCidToCluster(cid: string): Promise<any> {
    const result = (
      await axios({
        headers: {
          "Content-Type": "multipart/form-data",
        },
        method: `post`,
        url: `https://ipfs-cluster.zeitgeist.pm/pins/${cid}?replication-min=2&replication-max=2`,
        auth: {
          username: `zeitgeist`,
          password: `5ZpmQl*rWn%Z`,
        },
      })
    ).data;
    return result;
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
