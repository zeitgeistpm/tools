/* eslint-disable */
// @ts-nocheck

/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
import { generateInterfaceTypes } from '@polkadot/typegen/generate/interfaceRegistry';
import { generateTsDef } from '@polkadot/typegen/generate/tsDef';
// import {
//   generateDefaultConsts,
//   generateDefaultQuery,
//   generateDefaultTx,
//   generateDefaultRpc
// } from '@polkadot/typegen/generate';
// import metaHex from '../src/metadata/static-latest';

import * as defaultDefinitions from '@polkadot/types/interfaces/definitions';
import * as zgDefinitions from '../src/interfaces/definitions';

// // eslint-disable-next-line @typescript-eslint/no-unused-vars
const { ...substrateDefinitions } = defaultDefinitions;

const definitions = {
  '@polkadot/types/interfaces': substrateDefinitions,
  '@zeitgeistpm/types/interfaces': zgDefinitions
} as any;

generateTsDef(definitions, 'packages/types/src/interfaces', '@zeitgeistpm/types/interfaces');
generateInterfaceTypes(definitions, 'packages/types/src/interfaces/augment-types.ts');
// generateDefaultConsts('packages/types/src/interfaces/augment-api-consts.ts', metadata, definitions);

// generateDefaultTx('packages/types/src/interfaces/augment-api-tx.ts', metadata, definitions);
// generateDefaultQuery('packages/types/src/interfaces/augment-api-query.ts', metadata, definitions);
// generateDefaultRpc('packages/types/src/interfaces/augment-api-rpc.ts', definitions);
