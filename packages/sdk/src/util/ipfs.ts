import ipfsClient from "ipfs-http-client";

export const initIpfs = () => {
  return ipfsClient({
    url: "https://ipfs.zeitgeist.pm",
  });
};
