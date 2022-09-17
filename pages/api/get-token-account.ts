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
  getAssociatedTokenAddress,
  getOrCreateAssociatedTokenAccount,
  TOKEN_2022_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";

const getTokenAccount: NextApiHandler = async (req, response) => {
  const { tokenMintAddress, walletAddress } = req.body;

  console.log({ tokenMintAddress, walletAddress });

  if (!tokenMintAddress || !walletAddress)
    throw new Error("Missing required fields");

  if (!process.env.PRIVATE_KEY) {
    response.status(500).json({ error: "Missing private key" });
    return;
  }

  const connection = new Connection(RPC_ENDPOINT);
  // const keypair = Keypair.fromSecretKey(bs58.decode(process.env.PRIVATE_KEY));

  let tokenAccount;
  try {
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
    return;
  }

  console.log({ tokenAccount, delegate: tokenAccount.delegate?.toString() });

  response.json({ done: true });
};

export default getTokenAccount;
