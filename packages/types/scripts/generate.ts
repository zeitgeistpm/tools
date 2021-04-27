/* eslint-disable */
// @ts-nocheck

/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
import { Metadata } from '@polkadot/metadata';
import { TypeRegistry } from '@polkadot/types/create';
import { generateInterfaceTypes } from '@polkadot/typegen/generate/interfaceRegistry';
import { generateTsDef } from '@polkadot/typegen/generate/tsDef';
// import {
//   generateDefaultConsts,
//   generateDefaultQuery,
//   generateDefaultTx,
//   generateDefaultRpc
// } from '@polkadot/typegen/generate';
import { registerDefinitions } from '@polkadot/typegen/util';
import metaHex from '../src/metadata/static-latest';

import * as defaultDefinitions from '@polkadot/types/interfaces/definitions';
import * as zgDefinitions from '../src/interfaces/definitions';

// Only keep our own modules to avoid confllicts with the one provided by polkadot.js
// TODO: make an issue on polkadot.js
function filterModules(names: string[], defs: any): string {
  const registry = new TypeRegistry();
  registerDefinitions(registry, defs);

  const metadata = new Metadata(registry, metaHex);

  // hack https://github.com/polkadot-js/api/issues/2687#issuecomment-705342442
  metadata.asLatest.toJSON();

  const filtered = metadata.toJSON() as any;

  console.log(filtered.metadata);

  filtered.metadata.v12.modules = filtered.metadata.v12.modules.filter(({ name }: any) => names.includes(name));

  return new Metadata(registry, filtered).toHex();
}

// // eslint-disable-next-line @typescript-eslint/no-unused-vars
const { ...substrateDefinitions } = defaultDefinitions;

const definitions = {
  '@polkadot/types/interfaces': substrateDefinitions,
  '@zeitgeistpm/types/interfaces': zgDefinitions
} as any;

const metadata = filterModules(
  [
    'Orderbook',
    'PredictionMarkets',
    'Swaps'
  ],
  definitions
);

generateTsDef(definitions, 'packages/types/src/interfaces', '@zeitgeistpm/types/interfaces');
generateInterfaceTypes(definitions, 'packages/types/src/interfaces/augment-types.ts');
// generateDefaultConsts('packages/types/src/interfaces/augment-api-consts.ts', metadata, definitions);

// generateDefaultTx('packages/types/src/interfaces/augment-api-tx.ts', metadata, definitions);
// generateDefaultQuery('packages/types/src/interfaces/augment-api-query.ts', metadata, definitions);
// generateDefaultRpc('packages/types/src/interfaces/augment-api-rpc.ts', definitions);
