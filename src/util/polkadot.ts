import { ApiPromise, WsProvider } from "@polkadot/api";
import Keyring from "@polkadot/keyring";

import * as zeitgeistDefinitions from '@zeitgeistpm/type-definitions';

const typesFromDefs = (definitions: Record<string, { types: Record<string, any> }>): Record<string, any> => {
  return Object
    .values(definitions)
    .reduce((res: Record<string, any>, { types }): Record<string, any> => ({
      ...res,
      ...types
    }), {});
}

export const initApi = (endpoint = 'ws://localhost:9944'): Promise<ApiPromise> => {
  return ApiPromise.create({
    provider: new WsProvider(endpoint),
    types: typesFromDefs(zeitgeistDefinitions),
  });
}

export const signerFromSeed = (seed: string) => {
  const keyring = new Keyring({
    type: "sr25519",
  });
  return keyring.addFromUri(seed);
}
