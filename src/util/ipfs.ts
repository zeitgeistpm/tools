import ipfsClient from "ipfs-http-client";

export const initIpfs = () => {
  return ipfsClient({
    host: 'localhost',
    port: 5001,
    protocol: 'http',
  });
}

