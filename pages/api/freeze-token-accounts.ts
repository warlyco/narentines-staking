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
  getOrCreateAssociatedTokenAccount,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { createFreezeDelegatedAccountInstruction } from "@metaplex-foundation/mpl-token-metadata";
import { Metaplex } from "@metaplex-foundation/js";

const freezeTokenAccounts: NextApiHandler = async (req, response) => {
  const { tokenMintAddresses, walletAddress } = req.body;

  if (!tokenMintAddresses || !walletAddress)
    throw new Error("Missing required fields");

  if (!process.env.PRIVATE_KEY) {
    response.status(500).json({ error: "Missing private key" });
    return;
  }

  const connection = new Connection(RPC_ENDPOINT);
  const keypair = Keypair.fromSecretKey(bs58.decode(process.env.PRIVATE_KEY));
  const latestBlockhash = await connection.getLatestBlockhash();
  const transaction = new Transaction({ ...latestBlockhash });
  const metaplex = Metaplex.make(connection);

  let confirmation;
  for (const tokenMintAddress of tokenMintAddresses) {
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
      response.status(500).json({ error });
      return;
    }

    const nft = await metaplex
      .nfts()
      .findByMint({ mintAddress: new PublicKey(tokenMintAddress) })
      .run();

    const { mintAuthorityAddress } = nft.mint;
    if (!mintAuthorityAddress) {
      response.status(500).json({ error: "Could not find mint authority" });
      return;
    }
    transaction.add(
      createFreezeDelegatedAccountInstruction({
        delegate: new PublicKey(STAKING_WALLET_ADDRESS),
        tokenAccount: tokenAccount.address,
        edition: mintAuthorityAddress,
        mint: new PublicKey(tokenMintAddress),
        tokenProgram: TOKEN_PROGRAM_ID,
      })
    );
  }

  try {
    transaction.feePayer = new PublicKey(STAKING_WALLET_ADDRESS);

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
    // if (error?.includes('Node is behind by ')))
    response.status(500).send(error);
    console.error("the error is:", error);
    return;
  }
};

export default freezeTokenAccounts;
