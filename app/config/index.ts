import { Connection, PublicKey } from "@solana/web3.js"

export const solanaRpcUrl = ""
export const solanaWssUrl = ""
export const connection = new Connection(solanaRpcUrl, { wsEndpoint: solanaWssUrl })
export const passkey = "/"
export enum commitmentType {
    Finalized = "finalized",
    Confirmed = "confirmed",
    Processed = "processed"
}
export const jitoFee = 1_000_000

export const jupiterAPIURL = '';

export const systemProgram = new PublicKey('11111111111111111111111111111111')
export const eventAuthority = new PublicKey('')
export const pumpFunProgram = new PublicKey('')
export const rentProgram = new PublicKey('')