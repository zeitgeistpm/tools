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
  static async balanceOf(marketId: number, sharesIndex: number, account: string): Promise<string>
  {
    const api = await initApi();

    //@ts-ignore
    const shareHash = await api.rpc.predictionMarkets.marketOutcomeShareId(marketId, sharesIndex);
    const accountData = await api.query.shares.accounts(shareHash, account);
    
    //@ts-ignore
    return accountData.free.toString()
  }

  /**
   * Gets the reserved balance of a particular account.
   * @param marketId The unique id of the market.
   * @param shareIndex The index of the share.
   * @param account The account to fetch the reserved balance of.
   */
  static async reservedBalanceOf(marketId: number, sharesIndex: number, account: string): Promise<string>
  {
    const api = await initApi();

    //@ts-ignore
    const shareHash = await api.rpc.predictionMarkets.marketOutcomeShareId(marketId, sharesIndex);
    const accountData = await api.query.shares.accounts(shareHash, account);
    
    //@ts-ignore
    return accountData.reserved.toString()
  }

  static async totalSupply(marketId: number, sharesIndex: number): Promise<string> {
    const api = await initApi();

    //@ts-ignore
    const shareHash = await api.rpc.predictionMarkets.marketOutcomeShareId(marketId, sharesIndex);
    const totalSupply = await api.query.shares.totalSupply(shareHash);

    return totalSupply.toString();
  }
}

export default Shares;
