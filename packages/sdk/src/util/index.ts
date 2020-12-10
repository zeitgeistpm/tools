import { initIpfs } from "./ipfs";
import { initApi, signerFromSeed } from "./polkadot";

export { initApi, initIpfs, signerFromSeed };

export const changeEndianness = (string) => {
  const result = [];
  let len = string.length - 2;
  while (len >= 0) {
    result.push(string.substr(len, 2));
    len -= 2;
  }
  return result.join("");
};
