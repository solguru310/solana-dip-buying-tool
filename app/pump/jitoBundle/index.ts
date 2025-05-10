import { Keypair, PublicKey, SystemProgram, TransactionMessage, VersionedTransaction } from "@solana/web3.js";
import base58 from "bs58";
import axios, { AxiosError } from "axios";
import { jitoFee, connection, commitmentType } from "../../config";

// let counter: number = 0;
// export const getBundleCounter = () => {
//   return counter;
// }

// export const incrementBundleCounter = () => {
//   counter = (counter + 1) % 10001;
// }

export const jitoSwapBundle = async (transactions: VersionedTransaction[], payer: Keypair, counter: number) => {
  const tipAccounts = [
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
  ];
  const jitoFeeWallet = new PublicKey(tipAccounts[Math.floor(tipAccounts.length * Math.random())])

  try {
    const latestBlockhash = await connection.getLatestBlockhash()

    const jitTipTxFeeMessage = new TransactionMessage({
      payerKey: payer.publicKey,
      recentBlockhash: latestBlockhash.blockhash,
      instructions: [
        SystemProgram.transfer({
          fromPubkey: payer.publicKey,
          toPubkey: jitoFeeWallet,
          lamports: jitoFee,
        })
      ],
    }).compileToV0Message()

    const jitoFeeTx = new VersionedTransaction(jitTipTxFeeMessage)
    jitoFeeTx.sign([payer]);

    const jitoFeeTxsignature = base58.encode(jitoFeeTx.signatures[0])
    const serializedjitoFeeTx = base58.encode(jitoFeeTx.serialize())
    const serializedTransactions = [serializedjitoFeeTx]

    for (let i = 0; i < transactions.length; i++) {
      const serializedTransaction = base58.encode(transactions[i].serialize())
      serializedTransactions.push(serializedTransaction)
    }

    const defaultEndpoints = [
      '',
      '',
      ''
    ];


    const endpoint = defaultEndpoints[counter % defaultEndpoints.length];

    const response = await axios.post(endpoint, {
      jsonrpc: '2.0',
      id: 1,
      method: 'sendBundle',
      params: [serializedTransactions],
    });

    const bundleId = response.data.result;

    const confirmation = await connection.confirmTransaction(
      {
        signature: jitoFeeTxsignature,
        lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
        blockhash: latestBlockhash.blockhash,
      },
      commitmentType.Confirmed,
    );

    return { confirmed: !confirmation.value.err, jitoTxsignature: jitoFeeTxsignature, bundleId };
  } catch (error) {
    if (error instanceof AxiosError) {
      console.log('Failed to execute jito transaction');
    }
    console.log('Error during transaction execution', error);
    return { confirmed: false };
  }
}


