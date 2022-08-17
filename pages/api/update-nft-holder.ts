import type { NextApiHandler } from "next";
import { UPDATE_NFT_HOLDER } from "graphql/mutations/update-nft-holder";
import request, { GraphQLClient } from "graphql-request";
import { FETCH_NFT } from "graphql/queries/fetch-nft";
import { ADD_NFT } from "graphql/mutations/add-nft";
import { Metaplex } from "@metaplex-foundation/js";
import { RPC_ENDPOINT } from "constants/constants";
import { Connection, PublicKey } from "@solana/web3.js";
import axios from "axios";

const updateNft: NextApiHandler = async (req, response) => {
  const { mintAddress, walletAddress } = req.body;

  if (!mintAddress || !walletAddress)
    throw new Error("Missing required fields");

  let nft;
  try {
    // Fetch the NFT from the database
    const { nfts } = await request({
      url: process.env.NEXT_PUBLIC_ADMIN_GRAPHQL_API_ENDPOINT!,
      document: FETCH_NFT,
      variables: {
        mintAddress,
      },
      requestHeaders: {
        "x-hasura-admin-secret": process.env.HASURA_GRAPHQL_ADMIN_SECRET!,
      },
    });

    console.log("```nfts", nfts);

    if (nfts?.[0] && nfts[0].holderWalletAddress === walletAddress) {
      response.status(200).json({ nft: nfts?.[0] });
      return;
    } else {
      const res = await request({
        url: process.env.NEXT_PUBLIC_ADMIN_GRAPHQL_API_ENDPOINT!,
        document: ADD_NFT,
        variables: {
          mintAddress,
        },
        requestHeaders: {
          "x-hasura-admin-secret": process.env.HASURA_GRAPHQL_ADMIN_SECRET!,
        },
      });
    }

    const connection = new Connection(RPC_ENDPOINT);
    const metaplex = Metaplex.make(connection);
    const nftFromMetaplex = await metaplex
      .nfts()
      .findByMint(new PublicKey(mintAddress))
      .run();
    nft = nftFromMetaplex;
    console.log("nftFromMetaplex", nftFromMetaplex);
  } catch (error) {
    console.log(error);
    response.status(500).json({ error });
  }

  try {
    const { name, image } = nft.json;
    const { address } = nft;
    const timestamp = new Date().toISOString();
    console.log("```image", image);

    const { update_nfts_by_pk } = await request({
      url: process.env.NEXT_PUBLIC_ADMIN_GRAPHQL_API_ENDPOINT!,
      document: UPDATE_NFT_HOLDER,
      variables: {
        name,
        mintAddress: address.toString(),
        holderWalletAddress: walletAddress,
        timestamp,
      },
      requestHeaders: {
        "x-hasura-admin-secret": process.env.HASURA_GRAPHQL_ADMIN_SECRET!,
      },
    });

    response.json({ nft: update_nfts_by_pk });
  } catch (error) {
    console.error(error);
    response.status(500).json({ error });
  }
};

export default updateNft;
