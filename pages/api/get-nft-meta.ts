import type { NextApiHandler } from "next";
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
import { Metaplex } from "@metaplex-foundation/js";

const getTokenAccount: NextApiHandler = async (req, response) => {
  const { mintAddress } = req.body;

  console.log({ mintAddress });

  if (!mintAddress) throw new Error("Missing required fields");

  const connection = new Connection(RPC_ENDPOINT);
  // const keypair = Keypair.fromSecretKey(bs58.decode(process.env.PRIVATE_KEY));

  try {
    const metaplex = Metaplex.make(connection);
    const nft = await metaplex.nfts().findByMint({ mintAddress }).run();
    return response.status(200).json({ nft });
  } catch (error) {
    console.error(error);
    return;
  }
};

export default getTokenAccount;
