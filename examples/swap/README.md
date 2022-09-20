# Swap

### toJSONString

You can use this function to convert market object into string.

```typescript
const sdk = await SDK.initialize(endpoint);

const res = await sdk.models.getAllMarkets();

res.forEach((market) => console.log(market.toJSONString()));
```

### getSpotPrice

You can use this function to get spot price in the specified block.

```typescript
const price = await pool.getSpotPrice(AssetIn, AssetOut, blockHash);
```

**Arguments**
| Name | Type | Introduction |
| ---- | ---- | ------------ |
| inAsset | string/Asset | |
| outAsset | string/Asset | |
| blockHash | any | not necessarily. The unique identifier for the block to fetch asset spot prices. |

[Code snippet](./getSpotPrice.ts)

### assetSpotPricesInZtg

You can use this function to fetch spot prices of all assets in this market.
Can be used to find prices at a particular block using unique identifier.

```typescript
const res = market.assetSpotPricesInZtg(blockHash);
```

**Arguments**
| Name | Type | Introduction |
| ---- | ---- | ------------ |
| blockHash | any | not necessarily. The unique identifier for the block to fetch asset spot prices. |

[Code snippet](./assetSpotPricesInZtg.ts)

### fetchPoolSpotPrices

You can use this function to fetch spot prices of specified blocks.

```typescript
const prices = await pool.fetchPoolSpotPrices(
  assetIn,
  assetOut,
  blocksAsNumArray
);
```

**Arguments**
| Name | Type | Introduction |
| ---- | ---- | ------------ |
| inAsset | string/Asset | |
| outAsset | string/Asset | |
| blockNumbers | number[] | The block numbers you want to check |

[Code snippet](./fetchPoolSpotPrices.ts)

### sharesId

You can use this function to fetch all shares' ids.

```typescript
const sharesId = await pool.sharesId();
```

[Code snippet](./sharesId.ts)

### accountId

You can use this function to fetch account id in this pool.

```typescript
const account = await pool.accountId();
```

[Code snippet](./accountId.ts)

### joinPool

You can use this function to join pool.

```typescript
const res = await pool.joinPool(signer, poolAmountOut, maxAmountsIn, false);
```

**Arguments**
| Name | Type | Introduction |
| ---- | ---- | ------------ |
| signer | KeyringPairOrExtSigner | The actual signer provider to sign the transaction. |
| poolAmountOut | string | The amount of LP shares for this pool that should be minted to the provider. |
| maxAmountsIn | string[] | List of asset upper bounds. The values are maximum limit for the assets. |
| callbackOrPaymentInfo | boolean | "true" to get txn fee estimation otherwise callback to capture transaction result. |

[Code snippet](./joinPool.ts)

### poolJoinWithExactAssetAmount

You can use this function to join exact asset amount to the pool.

```typescript
const res = await pool.poolJoinWithExactAssetAmount(
  signer,
  JSON.parse(assetIn),
  assetAmount,
  minPoolAmount,
  false
);
```

**Arguments**
| Name | Type | Introduction |
| ---- | ---- | ------------ |
| signer | KeyringPairOrExtSigner | The actual signer provider to sign the transaction. |
| assetIn | any | Asset entering the pool. |
| assetAmount | any | Asset amount that is entering the pool. |
| minPoolAmount | any | The calculated amount for the pool must be equal or greater than the given value. |
| callbackOrPaymentInfo | any | "true" to get txn fee estimation otherwise callback to capture transaction result. |

[Code snippet](./poolJoinWithExactAssetAmount.ts)

### joinPoolMultifunc

You can use this function to join pool.
Three substrate join_pool_xxx functions in one

```typescript
const res = await pool.joinPoolMultifunc(
  signer,
  {
    bounds: trimmedBounds as any,
  },
  false
);
```

**Arguments**
| Name | Type | Introduction |
| ---- | ---- | ------------ |
| signer | KeyringPairOrExtSigner | The actual signer provider to sign the transaction. |
| opts | poolJoinOpts | To be provided with `asset`, `bounds.assetAmount`, `bounds.poolMin` for MinPool and with `asset`, `bounds.poolAmount`, `bounds.AssetMin` for MaxAsset and with `bounds.poolAmount`, `bounds.AssetMin` for `sdk.models.swaps.joinPool`. |
| callbackOrPaymentInfo | boolean | "true" to get txn fee estimation otherwise callback to capture transaction result. |

[Code snippet](./joinPoolMultifunc.ts)

### exitPool

You can use this function to retrieve a given set of assets from pool to the signer.

```typescript
const res = await pool.exitPool(signer, poolAmountOut, maxAmountsIn, false);
```

**Arguments**
| Name | Type | Introduction |
| ---- | ---- | ------------ |
| signer | KeyringPairOrExtSigner | The actual signer provider to sign the transaction. |
| poolAmountIn | string | The amount of LP shares of this pool being burned based on the retrieved assets. |
| minPoolAmount | string[] | List of asset lower bounds. The values are minimum limit for the assets. |
| callbackOrPaymentInfo | boolean | "true" to get txn fee estimation otherwise callback to capture transaction result. |

[Code snippet](./exitPool.ts)

### swapExactAmountIn

You can use this function to swap a given `assetAmountIn` of the `assetIn/assetOut` pair to pool.

```typescript
const res = await pool.swapExactAmountIn(
  signer,
  assetIn,
  assetAmountIn,
  assetOut,
  minAmountOut,
  maxPrice,
  false
);
```

**Arguments**
| Name | Type | Introduction |
| ---- | ---- | ------------ |
| signer | KeyringPairOrExtSigner | The actual signer provider to sign the transaction. |
| assetIn | string | Asset entering the pool. |
| assetAmountIn | string | Amount that will be transferred from the provider to the pool. |
| assetOut | boolean | Asset leaving the pool. |
| minAmountOut | string | Minimum asset amount that can leave the pool. |
| maxPrice | string | Market price must be equal or less than the provided value. |
| callbackOrPaymentInfo | boolean | "true" to get txn fee estimation otherwise callback to capture transaction result. |

[Code snippet](./swapExactAmountIn.ts)

### swapExactAmountOut

You can use this function to swap a given `assetAmountOut` of the `assetIn/assetOut` pair to pool.

```typescript
const res = await pool.swapExactAmountOut(
  signer,
  assetIn,
  assetAmountIn,
  assetOut,
  minAmountOut,
  maxPrice,
  false
);
```

**Arguments**
| Name | Type | Introduction |
| ---- | ---- | ------------ |
| signer | KeyringPairOrExtSigner | The actual signer provider to sign the transaction. |
| assetIn | string | Asset entering the pool. |
| assetAmountIn | string | Amount that will be transferred from the provider to the pool. |
| assetOut | boolean | Asset leaving the pool. |
| minAmountOut | string | Minimum asset amount that can leave the pool. |
| maxPrice | string | Market price must be equal or less than the provided value. |
| callbackOrPaymentInfo | boolean | "true" to get txn fee estimation otherwise callback to capture transaction result. |

[Code snippet](./swapExactAmountOut.ts)
