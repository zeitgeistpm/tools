// Auto-generated via `yarn polkadot-types-from-defs`, do not edit
/* eslint-disable */

import type { Enum, Option, Struct } from '@polkadot/types-codec';
import type { AccountId, Balance } from '@polkadot/types/interfaces/runtime';
import type { Asset } from '@zeitgeistpm/types/interfaces/index';

/** @name Order */
export interface Order extends Struct {
  readonly side: OrderSide;
  readonly maker: AccountId;
  readonly taker: Option<AccountId>;
  readonly asset: Asset;
  readonly total: Balance;
  readonly price: Balance;
  readonly filled: Balance;
}

/** @name OrderSide */
export interface OrderSide extends Enum {
  readonly isBid: boolean;
  readonly isAsk: boolean;
  readonly type: 'Bid' | 'Ask';
}

export type PHANTOM_ORDERBOOK = 'orderbook';
