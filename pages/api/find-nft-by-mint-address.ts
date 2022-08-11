import { keypairIdentity, Metaplex } from "@metaplex-foundation/js";
import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import { RPC_ENDPOINT } from "constants/constants";
import { Request, Response } from "express-serve-static-core";
import fs from "fs";

const { KEYPAIR_FILE } = process.env;

export default async function handler(req: Request, res: Response) {
  if (!req.body?.mintAddress) {
    res.status(500).send("nft mint required");
    return;
  }

  if (!KEYPAIR_FILE) return;

  const rpcConnection = new Connection(RPC_ENDPOINT);
  const keypairFile = fs.readFileSync(KEYPAIR_FILE);
  const keypair = Keypair.fromSecretKey(
    Buffer.from(JSON.parse(keypairFile.toString()))
  );

  try {
    const metaplex = Metaplex.make(rpcConnection).use(keypairIdentity(keypair));
    console.log(metaplex, req.body?.mintAddress);
    const nfts = await metaplex.nfts().findByMint(req.body?.mintAddress);
    res.status(200).json({ nfts });
  } catch (err) {
    const typedError = err as Error;
    res.status(500).send(`error ${typedError.message}`);
  }
}
