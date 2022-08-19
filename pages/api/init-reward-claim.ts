import type { NextApiHandler } from "next";
import request from "graphql-request";
import { UPDATE_NFTS_HOLDER } from "graphql/mutations/update-nfts-holder";
import {
  GOODS_TOKEN_MINT_ADDRESS,
  RPC_ENDPOINT,
  STAKING_WALLET_ADDRESS,
} from "constants/constants";
import {
  Connection,
  Keypair,
  PublicKey,
  sendAndConfirmTransaction,
  Transaction,
} from "@solana/web3.js";
import * as bs58 from "bs58";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  createTransferInstruction,
  getOrCreateAssociatedTokenAccount,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";

const initRewardClaim: NextApiHandler = async (req, response) => {
  const { mintAddress, amount, rewardTokenAddress, walletAddress } = req.body;

  if (
    !mintAddress ||
    !amount ||
    !rewardTokenAddress ||
    !walletAddress ||
    !process.env.PRIVATE_KEY
  )
    throw new Error("Missing required fields");

  const connection = new Connection(RPC_ENDPOINT);
  const keypair = Keypair.fromSecretKey(bs58.decode(process.env.PRIVATE_KEY));

  let fromTokenAccount;
  try {
    fromTokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      keypair,
      new PublicKey(rewardTokenAddress),
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
      keypair,
      new PublicKey(rewardTokenAddress),
      new PublicKey(walletAddress),
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
      amount * 100,
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
        commitment: "finalized",
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

export default initRewardClaim;
