import type { NextApiHandler } from "next";
import request from "graphql-request";
import {
  MS_PER_DAY,
  PRIMARY_REWARD_AMOUNT_PER_DAY,
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
import dayjs from "dayjs";
import { FETCH_NFTS_BY_MINT_ADDRESSES } from "graphql/queries/fetch-nfts-by-mint-addresses";
import { UPDATE_NFTS_CLAIM_TIME } from "graphql/mutations/update-nfts-claim-time";

const initRewardClaim: NextApiHandler = async (req, response) => {
  const { mintAddresses, rewardTokenAddress, walletAddress } = req.body;

  if (
    !mintAddresses ||
    !rewardTokenAddress ||
    !walletAddress ||
    !process.env.PRIVATE_KEY
  )
    throw new Error("Missing required fields");

  let nftsInDb;
  try {
    const { nfts } = await request({
      url: process.env.NEXT_PUBLIC_ADMIN_GRAPHQL_API_ENDPOINT!,
      document: FETCH_NFTS_BY_MINT_ADDRESSES,
      variables: {
        mintAddresses,
      },
      requestHeaders: {
        "x-hasura-admin-secret": process.env.HASURA_GRAPHQL_ADMIN_SECRET!,
      },
    });
    nftsInDb = nfts;
    console.log("Fetched NFTs from database", nftsInDb);
  } catch (error) {
    console.log(error);
    response.status(500).json({ error });
  }

  let totalPayoutAmount = 0;
  nftsInDb.forEach(async (nft: any) => {
    const { timestamp, lastClaimTimestamp } = nft;
    const now = dayjs();
    let stakingTime;
    if (!lastClaimTimestamp) {
      stakingTime = dayjs(timestamp);
    } else {
      stakingTime = dayjs(lastClaimTimestamp);
    }
    const timeSinceStakingInMs = now.diff(stakingTime);
    const timeSinceStakingInDays = timeSinceStakingInMs / MS_PER_DAY;

    const rewardAmount = Number(
      (timeSinceStakingInDays * PRIMARY_REWARD_AMOUNT_PER_DAY).toFixed(2)
    );
    totalPayoutAmount = Number((totalPayoutAmount + rewardAmount).toFixed(2));
    console.log({ rewardAmount });
  });
  console.log({ totalPayoutAmount });

  try {
    const { update_nfts } = await request({
      url: process.env.NEXT_PUBLIC_ADMIN_GRAPHQL_API_ENDPOINT!,
      document: UPDATE_NFTS_CLAIM_TIME,
      variables: {
        mintAddresses,
        lastClaimTimestamp: new Date().toISOString(),
      },
      requestHeaders: {
        "x-hasura-admin-secret": process.env.HASURA_GRAPHQL_ADMIN_SECRET!,
      },
    });
    console.log("claim updated", update_nfts);
  } catch (error) {
    console.error(error);
    response.status(500).json({ error });
    return;
  }

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
      // totalPayoutAmount * 100,
      Number(totalPayoutAmount.toFixed(2)) * 100,
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
      // rollback purchase?
      return;
    }
  } catch (error) {
    response.status(500).json({ error });
    return;
  }
  response.json({ confirmation });
};

export default initRewardClaim;
