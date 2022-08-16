import type { NextApiHandler } from "next";
import request from "graphql-request";
import {
  KEYPAIR_FILE,
  RPC_ENDPOINT,
  STAKING_WALLET_ADDRESS,
} from "constants/constants";
import fs from "fs";
import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import { keypairIdentity, Metaplex } from "@metaplex-foundation/js";
import { getOrCreateAssociatedTokenAccount } from "@solana/spl-token";

const stakeNft: NextApiHandler = async (req, response) => {
  const { mintAddress, fromWalletAddress } = req.body;

  if (!mintAddress || !fromWalletAddress || !KEYPAIR_FILE)
    throw new Error("Missing required fields");

  const connection = new Connection(RPC_ENDPOINT);
  const keypairFile = fs.readFileSync(KEYPAIR_FILE);
  const keypair = Keypair.fromSecretKey(
    Buffer.from(JSON.parse(keypairFile.toString()))
  );

  let nft;
  try {
    const metaplex = Metaplex.make(connection).use(keypairIdentity(keypair));
    nft = await metaplex
      .nfts()
      .findByMint(new PublicKey(mintAddress), true)
      .run();

    const fromPublicKey = new PublicKey(fromWalletAddress);
    const tokenPublicKey = nft.mintAddress;
    const toPublicKey = new PublicKey(STAKING_WALLET_ADDRESS);

    const fromTokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      keypair,
      tokenPublicKey,
      fromPublicKey
    );

    const toTokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      keypair,
      tokenPublicKey,
      toPublicKey
    );
  } catch (err) {
    const typedError = err as Error;
    response.status(500).send(`error ${typedError.message}`);
  }

  try {
    response.json({ nft });
  } catch (error) {
    console.error(error);
    response.status(500).json({ error });
  }
};

export default stakeNft;
