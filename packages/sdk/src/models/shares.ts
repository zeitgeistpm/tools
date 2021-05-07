import { ApiPromise } from "@polkadot/api";
import { KeyringPair } from "@polkadot/keyring/types";
import { AnyJson } from "@polkadot/types/types";
import { encodeAddress } from "@polkadot/util-crypto";

import { NativeShareId } from "../consts";
import { KeyringPairOrExtSigner } from "../types";
import { initApi, isExtSigner } from "../util";

/**
 * The Shares class provides an interface for getting shares related data.
 */
class Shares {
  private api: ApiPromise;

  constructor(api: ApiPromise) {
    this.api = api;
  }

  /**
   * Gets all share identifiers that exist on chain. WARNING: This
   * call might take a while to complete! Code accordingly.
   * @returns string[] An array of all the ids as hex strings.
   */
  public async getAllShareIds(): Promise<string[]> {
    const rawKeys = await this.api.query.shares.accounts.keys();
    const shareIds = new Set();
    for (const rawKey of rawKeys) {
      const shareId = "0x" + rawKey.toString().slice(-160, -96);
      shareIds.add(shareId);
    }

    return Array.from(shareIds) as string[];
  }

  /**
   * Gets all share identifiers held by a particular account. WARNING:
   * this call might take a while to complete! Code accordingly.
   * @param account The account to query.
   * @returns string[] An array of all the ids as hex strings.
   */
  public async getAllShareIdsHeldBy(account: string): Promise<string[]> {
    const rawKeys = await this.api.query.shares.accounts.keys();
    const myShares = [];
    for (const key of rawKeys) {
      const shareId = key.toString().slice(-160, -96);
      const accountId = key.toString().slice(-64);
      const gotAccount = encodeAddress("0x" + accountId, 42);
      if (gotAccount == account) {
        myShares.push("0x" + shareId);
      }
    }

    return myShares;
  }

  /**
   * Gets the free balance of a particular account.
   * @param marketId The unique id of the market.
   * @param shareIndex The index of the share.
   * @param account The account to fetch the free balance of.
   */
  static async externBalanceOf(
    marketId: number,
    sharesIndex: number,
    account: string
  ): Promise<string> {
    const api = await initApi();

    //@ts-ignore
    const shareHash = await api.rpc.predictionMarkets.marketOutcomeShareId(
      marketId,
      sharesIndex
    );
    const accountData = await Shares._balanceOf(api, shareHash, account);

    //@ts-ignore
    return accountData.free.toString();
  }

  static async externTotalSupply(
    marketId: number,
    sharesIndex: number
  ): Promise<string> {
    const api = await initApi();

    //@ts-ignore
    const shareHash = await api.rpc.predictionMarkets.marketOutcomeShareId(
      marketId,
      sharesIndex
    );

    return Shares._totalSupply(api, shareHash);
  }

  private static async _balanceOf(
    api: ApiPromise,
    sharesHash: string,
    account: string
  ): Promise<AnyJson> {
    const accountData = await api.query.shares.accounts(sharesHash, account);

    return accountData.toJSON();
  }

  private static async _totalSupply(
    api: ApiPromise,
    sharesHash: string
  ): Promise<string> {
    const totalSupply = await api.query.shares.totalSupply(sharesHash);

    return totalSupply.toString();
  }

  async balanceOf(shareHash: string, account: string): Promise<AnyJson> {
    return Shares._balanceOf(this.api, shareHash, account);
  }

  async totalSupply(shareHash: string): Promise<string> {
    return Shares._totalSupply(this.api, shareHash);
  }

  /**
   * Gets the reserved balance of a particular account.
   * @param marketId The unique id of the market.
   * @param shareIndex The index of the share.
   * @param account The account to fetch the reserved balance of.
   */
  static async reservedBalanceOf(
    marketId: number,
    sharesIndex: number,
    account: string
  ): Promise<string> {
    const api = await initApi();

    //@ts-ignore
    const shareHash = await api.rpc.predictionMarkets.marketOutcomeShareId(
      marketId,
      sharesIndex
    );
    const accountData = await api.query.shares.accounts(shareHash, account);

    //@ts-ignore
    return accountData.reserved.toString();
  }

  public static externWrapNativeCurrency = async (
    signer: KeyringPair,
    amount: string
  ): Promise<string> => {
    const api = await initApi();

    return Shares._wrapNativeCurrency(api, signer, amount);
  };

  /**
   * Wraps some amount of native currency to wrapped currency.
   * @param signer The signer provider that can sign the transaction.
   * @param amount The amount of currency to wrap.
   */
  wrapNativeCurrency = async (
    signer: KeyringPairOrExtSigner,
    amount: string
  ): Promise<string> => {
    return Shares._wrapNativeCurrency(this.api, signer, amount);
  };

  private static _wrapNativeCurrency = async (
    api: ApiPromise,
    signer: KeyringPairOrExtSigner,
    amount: string
  ): Promise<string> => {
    if (isExtSigner(signer)) {
      return (
        await api.tx.shares
          .wrapNativeCurrency(amount)
          .signAndSend(signer.address, { signer: signer.signer })
      ).toString();
    } else {
      return (
        await api.tx.shares.wrapNativeCurrency(amount).signAndSend(signer)
      ).toString();
    }
  };

  public static externUnwrapNativeCurrency = async (
    signer: KeyringPair,
    amount: string
  ): Promise<string> => {
    const api = await initApi();

    return Shares._unwrapNativeCurrency(api, signer, amount);
  };

  /**
   * Unwraps some amount of wrapped currency to native currency.
   * @param signer The signer provider that will sign the transaction.
   * @param amount The amount of wrapped currency to unwrap.
   */
  unwrapNativeCurrency = async (
    signer: KeyringPairOrExtSigner,
    amount: string
  ): Promise<string> => {
    return Shares._unwrapNativeCurrency(this.api, signer, amount);
  };

  private static _unwrapNativeCurrency = async (
    api: ApiPromise,
    signer: KeyringPairOrExtSigner,
    amount: string
  ): Promise<string> => {
    if (isExtSigner(signer)) {
      return (
        await api.tx.shares
          .unwrapNativeCurrency(amount)
          .signAndSend(signer.address, { signer: signer.signer })
      ).toString();
    } else {
      return (
        await api.tx.shares.unwrapNativeCurrency(amount).signAndSend(signer)
      ).toString();
    }
  };

  shareTransfer = async (
    signer: KeyringPair,
    marketId: number,
    sharesIndex: number,
    to: string,
    amount: string
  ): Promise<string> => {
    return Shares.transfer(signer, marketId, sharesIndex, to, amount);
  };

  static async transfer(
    signer: KeyringPair,
    marketId: number,
    sharesIndex: number,
    to: string,
    amount: string
  ): Promise<string> {
    const api = await initApi();

    //@ts-ignore
    const shareHash = await api.rpc.predictionMarkets.marketOutcomeShareId(
      marketId,
      sharesIndex
    );

    const hash = await api.tx.shares
      .transfer(to, shareHash, amount)
      .signAndSend(signer);

    return hash.toString();
  }

  static async shareId(marketId: number, sharesIndex: number): Promise<string> {
    const api = await initApi();

    //@ts-ignore
    return api.rpc.predictionMarkets.marketOutcomeShareId(
      marketId,
      sharesIndex
    );
  }

  static async invalidShareId(marketId: number): Promise<string> {
    return Shares.shareId(marketId, 0);
  }

  static async yesShareId(marketId: number): Promise<string> {
    return Shares.shareId(marketId, 1);
  }

  static async noShareId(marketId: number): Promise<string> {
    return Shares.shareId(marketId, 2);
  }

  static nativeShareId(): any {
    return NativeShareId;
  }
}
