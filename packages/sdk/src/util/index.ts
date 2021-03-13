import { initIpfs } from "./ipfs";
import { initApi, signerFromSeed, unsubOrWarns } from "./polkadot";
import { KeyringPairOrExtSigner, ExtSigner } from "../types";

export { initApi, initIpfs, signerFromSeed, unsubOrWarns };

export const changeEndianness = (string) => {
  const result = [];
  let len = string.length - 2;
  while (len >= 0) {
    result.push(string.substr(len, 2));
    len -= 2;
  }
  return result.join("");
};

export const isExtSigner = (
  signer: KeyringPairOrExtSigner
): signer is ExtSigner => {
  return (signer as ExtSigner).signer !== undefined;
};
