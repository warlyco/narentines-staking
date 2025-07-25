import type { NextApiHandler } from "next";
import request from "graphql-request";
import { FETCH_NFT } from "graphql/queries/fetch-nft";
import { UPDATE_NFTS_OWNER } from "graphql/mutations/update-nfts-owner";
import {
  NARENTINES_MINT_AUTHORITY,
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
  createApproveCheckedInstruction,
  createFreezeAccountInstruction,
  getOrCreateAssociatedTokenAccount,
  TOKEN_2022_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import {
  createFreezeDelegatedAccountInstruction,
  createThawDelegatedAccountInstruction,
} from "@metaplex-foundation/mpl-token-metadata";
import { Metaplex } from "@metaplex-foundation/js";

const thawTokenAccount: NextApiHandler = async (req, response) => {
  const { tokenMintAddress, walletAddress } = req.body;

  if (!tokenMintAddress || !walletAddress)
    throw new Error("Missing required fields");

  if (!process.env.PRIVATE_KEY) {
    response.status(500).json({ error: "Missing private key" });
    return;
  }

  console.log(1);
  const connection = new Connection(RPC_ENDPOINT);
  const keypair = Keypair.fromSecretKey(bs58.decode(process.env.PRIVATE_KEY));

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
    response.status(500).json({ error });
    console.error(error);
    return;
  }

  try {
    let confirmation;
    const latestBlockhash = await connection.getLatestBlockhash();
    const transaction = new Transaction({ ...latestBlockhash });
    const metaplex = Metaplex.make(connection);
    const nft = await metaplex
      .nfts()
      .findByMint({ mintAddress: new PublicKey(tokenMintAddress) })
      .run();

    const { mintAuthorityAddress } = nft.mint;
    if (!mintAuthorityAddress) {
      response.status(500).json({ error: "Could not find mint authority" });
      return;
    }
    console.log(2);
    transaction.add(
      createThawDelegatedAccountInstruction({
        delegate: new PublicKey(STAKING_WALLET_ADDRESS),
        tokenAccount: tokenAccount.address,
        edition: mintAuthorityAddress,
        mint: new PublicKey(tokenMintAddress),
        tokenProgram: TOKEN_PROGRAM_ID,
      })
    );

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
  } catch (error) {
    response.status(500).json({ error });
    console.error(error);
    return;
  }
};

export default thawTokenAccount;
