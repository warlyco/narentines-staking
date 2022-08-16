import type { NextApiHandler } from "next";
import request from "graphql-request";
import { KEYPAIR_FILE, RPC_ENDPOINT } from "constants/constants";
import fs from "fs";
import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import { keypairIdentity, Metaplex } from "@metaplex-foundation/js";

const stakeNft: NextApiHandler = async (req, response) => {
  const { mintAddress } = req.body;

  if (!mintAddress || !KEYPAIR_FILE) throw new Error("Missing required fields");

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
    // const info = await connection.getAccountInfoAndContext(
    //   new PublicKey(mintAddress)
    // );
    console.log("mintAddress", mintAddress);
    console.log("nft", nft);
    // console.log("info", info);
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
