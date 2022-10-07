import type { NextApiHandler } from "next";
import { RPC_ENDPOINT, STAKING_WALLET_ADDRESS } from "constants/constants";
import {
  Connection,
  Keypair,
  PublicKey,
  sendAndConfirmTransaction,
  Transaction,
} from "@solana/web3.js";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  createTransferInstruction,
  getOrCreateAssociatedTokenAccount,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import * as bs58 from "bs58";

const stakeNft: NextApiHandler = async (req, response) => {
  const { mintAddress, publicKey } = req.body;

  if (!mintAddress || !publicKey || !process.env.PRIVATE_KEY)
    throw new Error("Missing required fields");

  const connection = new Connection(RPC_ENDPOINT);
  const keypair = Keypair.fromSecretKey(bs58.decode(process.env.PRIVATE_KEY));

  let fromTokenAccount;
  try {
    fromTokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      // @ts-ignore
      new PublicKey(publicKey),
      new PublicKey(mintAddress),
      new PublicKey(STAKING_WALLET_ADDRESS),
      false,
      "confirmed",
      {},
      TOKEN_PROGRAM_ID,
      ASSOCIATED_TOKEN_PROGRAM_ID
    );
  } catch (error) {
    response.status(500).json({ error });
    return;
  }

  let toTokenAccount;
  try {
    toTokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      // @ts-ignore
      new PublicKey(publicKey),
      new PublicKey(mintAddress),
      new PublicKey(publicKey),
      false,
      "confirmed",
      {},
      TOKEN_PROGRAM_ID,
      ASSOCIATED_TOKEN_PROGRAM_ID
    );
  } catch (error) {
    response.status(500).json({ error });
    return;
  }

  const transaction = new Transaction();
  transaction.add(
    createTransferInstruction(
      fromTokenAccount.address,
      toTokenAccount.address,
      new PublicKey(STAKING_WALLET_ADDRESS),
      1,
      [],
      TOKEN_PROGRAM_ID
    )
  );

  let confirmation;
  try {
    const latestBlockHash = await connection.getLatestBlockhash();
    transaction.recentBlockhash = latestBlockHash.blockhash;
    console.log("sending transaction...");

    confirmation = await sendAndConfirmTransaction(
      connection,
      transaction,
      [keypair],
      {
        commitment: "confirmed",
        maxRetries: 10,
      }
    );
    console.log("confirmation", confirmation);
  } catch (error) {
    response.status(500).json({ error });
    return;
  }

  response.json({ confirmation });
};

export default stakeNft;
