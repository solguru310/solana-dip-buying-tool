import { ApiPoolInfoV4, jsonInfo2PoolKeys, Liquidity, LIQUIDITY_STATE_LAYOUT_V4, LiquidityPoolKeys, Market, MARKET_STATE_LAYOUT_V3, Percent, SPL_ACCOUNT_LAYOUT, SPL_MINT_LAYOUT, Token, TOKEN_PROGRAM_ID, TokenAccount, TokenAmount } from "@raydium-io/raydium-sdk"
import { AccountInfo, Connection, Keypair, PublicKey, Transaction, TransactionInstruction, VersionedTransaction, TransactionMessage, ComputeBudgetProgram, SystemProgram } from "@solana/web3.js"
import { createAssociatedTokenAccountIdempotentInstruction, createCloseAccountInstruction, createSyncNativeInstruction, getAssociatedTokenAddressSync, NATIVE_MINT } from "@solana/spl-token"
import { connection } from "../config";
import { jitoSwapBundle } from "../pump/jitoBundle";

export async function getWalletTokenAccount(connection: Connection, wallet: PublicKey): Promise<TokenAccount[]> {
    const walletTokenAccount = await connection.getTokenAccountsByOwner(wallet, {
        programId: TOKEN_PROGRAM_ID,
    });
    return walletTokenAccount.value.map((i) => ({
        pubkey: i.pubkey,
        programId: i.account.owner,
        accountInfo: SPL_ACCOUNT_LAYOUT.decode(i.account.data),
    }));
}

export const formatAmmKeysById = async (id: string): Promise<ApiPoolInfoV4 | undefined> => {
    try {
        let account: AccountInfo<Buffer> | null = null
        while (account === null) account = await connection.getAccountInfo(new PublicKey(id))
        const info = LIQUIDITY_STATE_LAYOUT_V4.decode(account.data)

        const marketId = info.marketId
        let marketAccount: AccountInfo<Buffer> | null = null
        while (marketAccount === null) marketAccount = await connection.getAccountInfo(marketId)
        if (marketAccount === null) throw Error(' get market info error')
        const marketInfo = MARKET_STATE_LAYOUT_V3.decode(marketAccount.data)

        const lpMint = info.lpMint
        let lpMintAccount: AccountInfo<Buffer> | null = null
        while (lpMintAccount === null) lpMintAccount = await connection.getAccountInfo(lpMint, 'processed')
        const lpMintInfo = SPL_MINT_LAYOUT.decode(lpMintAccount.data)

        return {
            id,
            baseMint: info.baseMint.toString(),
            quoteMint: info.quoteMint.toString(),
            lpMint: info.lpMint.toString(),
            baseDecimals: info.baseDecimal.toNumber(),
            quoteDecimals: info.quoteDecimal.toNumber(),
            lpDecimals: lpMintInfo.decimals,
            version: 4,
            programId: account.owner.toString(),
            authority: Liquidity.getAssociatedAuthority({ programId: account.owner }).publicKey.toString(),
            openOrders: info.openOrders.toString(),
            targetOrders: info.targetOrders.toString(),
            baseVault: info.baseVault.toString(),
            quoteVault: info.quoteVault.toString(),
            withdrawQueue: info.withdrawQueue.toString(),
            lpVault: info.lpVault.toString(),
            marketVersion: 3,
            marketProgramId: info.marketProgramId.toString(),
            marketId: info.marketId.toString(),
            marketAuthority: Market.getAssociatedAuthority({ programId: info.marketProgramId, marketId: info.marketId }).publicKey.toString(),
            marketBaseVault: marketInfo.baseVault.toString(),
            marketQuoteVault: marketInfo.quoteVault.toString(),
            marketBids: marketInfo.bids.toString(),
            marketAsks: marketInfo.asks.toString(),
            marketEventQueue: marketInfo.eventQueue.toString(),
            lookupTableAccount: PublicKey.default.toString()
        }
    } catch (e) {
        console.log(e)
    }
}

export const buy = async (poolId: PublicKey, outToken: PublicKey, wallet: Keypair, amount: number, counter: number) => {
    try {
        /**
         * Buy Function
         */
    } catch (err) {
        return {
            confirmed: false,
            error: 'Swap Error'
        }
    }
}

export const sell = async (poolId: PublicKey, inToken: PublicKey, wallet: Keypair, amount: number, counter: number) => {
    try {
        /**
         * Sell Function
         */

    } catch (err) {
        return {
            confirmed: false
        }
    }
}
