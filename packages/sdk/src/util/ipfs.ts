import ipfsClient from "ipfs-http-client";

export const initIpfs = (
  ipfsClientUrl = "https://ipfs.zeitgeist.pm"
): ReturnType<typeof ipfsClient> => {
  return ipfsClient({
    url: ipfsClientUrl,
  });
};
