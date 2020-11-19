import ipfsClient from "ipfs-http-client";

/** Creates an IPFS client connected to the Zeitgeist-hosted node. */
export const initIpfs = () => {
  return ipfsClient({
    url: "https://ipfs.zeitgeist.pm",
  });
};
