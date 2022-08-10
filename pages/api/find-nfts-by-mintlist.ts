import { keypairIdentity, Metaplex } from "@metaplex-foundation/js";
import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import { RPC_ENDPOINT_DEVNET } from "constants/constants";
import { Request, Response } from "express-serve-static-core";
import fs from "fs";

const {
  KEYPAIR_FILE,
  SOUL_MINTLIST_FILE,
  RESIDENCE_MINTLIST_FILE,
  TARGET_MINTLIST_FILE,
} = process.env;

export default async function handler(req: Request, res: Response) {
  if (!req.body?.list) {
    res.status(500).send("nft mint required");
    return;
  }

  if (
    !KEYPAIR_FILE ||
    !SOUL_MINTLIST_FILE ||
    !TARGET_MINTLIST_FILE ||
    !RESIDENCE_MINTLIST_FILE
  )
    return;

  const rpcConnection = new Connection(RPC_ENDPOINT_DEVNET);
  const keypairFile = fs.readFileSync(KEYPAIR_FILE);
  const keypair = Keypair.fromSecretKey(
    Buffer.from(JSON.parse(keypairFile.toString()))
  );
  const metaplex = Metaplex.make(rpcConnection).use(keypairIdentity(keypair));

  let mintListFile;
  // let mintListFile = '/path/to/mint-list-file';

  // @ts-ignore
  const rawMintList = fs.readFileSync(mintListFile);
  const mintList = JSON.parse(rawMintList);

  console.log(mintList);

  const keysList = mintList.map((mint: string) => new PublicKey(mint));

  const nfts = await metaplex.nfts().findAllByMintList(keysList);

  res.status(200).json({ nfts });
}
