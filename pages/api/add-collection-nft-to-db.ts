import type { NextApiHandler } from "next";
import request, { GraphQLClient } from "graphql-request";
import { FETCH_NFT } from "graphql/queries/fetch-nft";
import { ADD_NFT } from "graphql/mutations/add-nft";
import { Metaplex, Nft } from "@metaplex-foundation/js";
import { RPC_ENDPOINT } from "constants/constants";
import { Connection, PublicKey } from "@solana/web3.js";
import axios from "axios";
import hashlist from "Narentines-fullhashlist-magiceden.json";

const nftJsonKeysToMap = ["name", "image"];
const nftKeysToMap = ["uri", "address"];

type MappedNft = {
  [key: string]: string;
};

const addCollectionNftToDb: NextApiHandler = async (req, response) => {
  const { start, end } = req.body;

  if (start === undefined || !end) throw new Error("Missing required fields");

  const nftsToSave = hashlist.slice(start, end);

  const mintList = nftsToSave.map((address) => new PublicKey(address));

  const mapNft = (nft: Nft) => {
    const { json } = nft;
    const mappedNft: MappedNft = {} as MappedNft;
    for (let key of nftJsonKeysToMap) {
      if (key === "address") {
        // @ts-ignore
        mappedNft[key] = nft[key].toString();
      }
      // @ts-ignore
      mappedNft[key] = json[key];
    }
    for (let key of nftKeysToMap) {
      // @ts-ignore
      mappedNft[key] = nft[key];
    }
    return mappedNft;
  };

  let nfts = [];
  try {
    const connection = new Connection(RPC_ENDPOINT);
    const metaplex = Metaplex.make(connection);
    const nftsFromMetaplex = await metaplex
      .nfts()
      // @ts-ignore
      .findAllByMintList(mintList)
      .run();

    for (let nft of nftsFromMetaplex) {
      // @ts-ignore
      let fullNft = await metaplex.nfts().load(nft).run();
      // @ts-ignore
      const mappedNft = mapNft(fullNft);
      nfts.push(mappedNft);
      const { name, image, address, uri } = mappedNft;
      const { insert_nfts_one } = await request({
        url: process.env.NEXT_PUBLIC_ADMIN_GRAPHQL_API_ENDPOINT!,
        document: ADD_NFT,
        variables: {
          name,
          image,
          mintAddress: address,
          uri,
        },
        requestHeaders: {
          "x-hasura-admin-secret": process.env.HASURA_GRAPHQL_ADMIN_SECRET!,
        },
      });
    }

    // response.json({ nft: insert_nfts_one });
    response.json({ nfts });
  } catch (error) {
    console.error(error);
    response.status(500).json({ error });
  }
};

export default addCollectionNftToDb;
