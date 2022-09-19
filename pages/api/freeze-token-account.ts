import type { NextApiHandler } from "next";
import request from "graphql-request";
import { FETCH_NFT } from "graphql/queries/fetch-nft";
import { UPDATE_NFTS_OWNER } from "graphql/mutations/update-nfts-owner";
import { RPC_ENDPOINT, STAKING_WALLET_ADDRESS } from "constants/constants";
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
  createApproveCheckedInstruction,
  createFreezeAccountInstruction,
  getOrCreateAssociatedTokenAccount,
  TOKEN_2022_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { createFreezeDelegatedAccountInstruction } from "@metaplex-foundation/mpl-token-metadata";

const freezeTokenAccount: NextApiHandler = async (req, response) => {
  const { tokenMintAddress, walletAddress } = req.body;

  if (!tokenMintAddress || !walletAddress)
    throw new Error("Missing required fields");

  if (!process.env.PRIVATE_KEY) {
    response.status(500).json({ error: "Missing private key" });
    return;
  }

  const connection = new Connection(RPC_ENDPOINT);
  const keypair = Keypair.fromSecretKey(bs58.decode(process.env.PRIVATE_KEY));

  let tokenAccount;
  try {
    console.log("Fetching token account");
    tokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      // @ts-ignore
      new PublicKey(walletAddress),
      new PublicKey(tokenMintAddress),
      new PublicKey(walletAddress),
      false,
      "confirmed",
      {},
      TOKEN_PROGRAM_ID,
      ASSOCIATED_TOKEN_PROGRAM_ID
    );
  } catch (error) {
    console.error(error);
    response.status(500).json({ error });
    return;
  }

  try {
    let confirmation;
    const transaction = new Transaction();
    console.log("Create freeze tx");

    const MINT_AUTHORITY = "H2yUke2i77yi1aEMisFas17fjShUahvnihWTTdjuvh71";
    transaction.add(
      createFreezeDelegatedAccountInstruction({
        delegate: new PublicKey(STAKING_WALLET_ADDRESS),
        tokenAccount: tokenAccount.address,
        edition: new PublicKey(MINT_AUTHORITY),
        mint: new PublicKey(tokenMintAddress),
        tokenProgram: TOKEN_PROGRAM_ID,
      })
    );

    const latestBlockHash = await connection.getLatestBlockhash();
    transaction.recentBlockhash = latestBlockHash.blockhash;
    transaction.feePayer = new PublicKey(STAKING_WALLET_ADDRESS);

    console.log("Send and confirm freeze tx");
    confirmation = await sendAndConfirmTransaction(
      connection,
      transaction,
      [keypair],
      {
        commitment: "confirmed",
        maxRetries: 10,
      }
    );

    if (!confirmation) {
      response.status(500).json({ error: "Transaction failed" });
      return;
    }
    response.json({ confirmation });
    return;
  } catch (error) {
    response.status(500).json({ error });
    console.error(error);
    return;
  }
};

export default freezeTokenAccount;
