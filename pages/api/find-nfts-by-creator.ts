import { keypairIdentity, Metaplex } from "@metaplex-foundation/js";
import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import { RPC_ENDPOINT } from "constants/constants";
import { Request, Response } from "express-serve-static-core";
import fs from "fs";

const { KEYPAIR_FILE } = process.env;

export default async function handler(req: Request, res: Response) {
  if (!req.body?.creatorId) {
    res.status(500).send("creatorId required");
    return;
  }

  if (!KEYPAIR_FILE) return;

  const rpcConnection = new Connection(RPC_ENDPOINT);
  const keypairFile = fs.readFileSync(KEYPAIR_FILE);
  const keypair = Keypair.fromSecretKey(
    Buffer.from(JSON.parse(keypairFile.toString()))
  );
  const metaplex = Metaplex.make(rpcConnection).use(keypairIdentity(keypair));

  const nfts = await metaplex
    .nfts()
    .findAllByCreator(new PublicKey(req.body.creatorId));

  res.status(200).json({ nfts });
}
