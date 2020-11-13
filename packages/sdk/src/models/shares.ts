import { ApiPromise } from "@polkadot/api";
import { KeyringPair } from "@polkadot/keyring/types";
import { initApi } from "../util";

/**
 * The Shares class provides an interface for getting shares related data.
 */
class Shares {
  /**
   * Gets the free balance of a particular account.
   * @param marketId The unique id of the market.
   * @param shareIndex The index of the share.
   * @param account The account to fetch the free balance of.
   */
  static async balanceOf(
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
    return accountData.free.toString();
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

  static async totalSupply(
    marketId: number,
    sharesIndex: number
  ): Promise<string> {
    const api = await initApi();

    //@ts-ignore
    const shareHash = await api.rpc.predictionMarkets.marketOutcomeShareId(
      marketId,
      sharesIndex
    );
    const totalSupply = await api.query.shares.totalSupply(shareHash);

    return totalSupply.toString();
  }

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
}

export default Shares;
