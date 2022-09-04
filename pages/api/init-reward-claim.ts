import type { NextApiHandler } from "next";
import request from "graphql-request";
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
import { UPDATE_NFT_CLAIM_TIME } from "graphql/mutations/update-nft-claim-time";

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
    if (!confirmation) {
      response.status(500).json({ error: "Transaction failed" });
      return;
    }

    try {
      const { update_nfts_by_pk } = await request({
        url: process.env.NEXT_PUBLIC_ADMIN_GRAPHQL_API_ENDPOINT!,
        document: UPDATE_NFT_CLAIM_TIME,
        variables: {
          mintAddress,
          lastClaimTimestamp: new Date().toISOString(),
        },
        requestHeaders: {
          "x-hasura-admin-secret": process.env.HASURA_GRAPHQL_ADMIN_SECRET!,
        },
      });
      console.log("claim updated", update_nfts_by_pk);
    } catch (error) {
      console.error(error);
      response.status(500).json({ error });
      return;
    }
  } catch (error) {
    response.status(500).json({ error });
    return;
  }
  response.json({ confirmation });
};

export default initRewardClaim;
