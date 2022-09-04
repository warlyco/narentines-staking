import type { NextApiHandler } from "next";
import request, { GraphQLClient } from "graphql-request";
import { FETCH_NFT } from "graphql/queries/fetch-nft";
import { UPDATE_NFT_OWNER } from "graphql/mutations/update-nft-owner";

const updateNftOwner: NextApiHandler = async (req, response) => {
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
  } catch (error) {
    console.log(error);
    response.status(500).json({ error });
  }

  try {
    // const connection = new Connection(RPC_ENDPOINT);
    // const metaplex = Metaplex.make(connection);
    // const nftFromMetaplex = await metaplex
    //   .nfts()
    //   .findByMint(new PublicKey(mintAddress))
    //   .run();

    // console.log("nftFromMetaplex", nftFromMetaplex);

    // if holder is confrimed and is not staking wallet, set as owner

    const { update_nfts_by_pk } = await request({
      url: process.env.NEXT_PUBLIC_ADMIN_GRAPHQL_API_ENDPOINT!,
      document: UPDATE_NFT_OWNER,
      variables: {
        mintAddress,
        walletAddress,
        timestamp: new Date().toISOString(),
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

export default updateNftOwner;
