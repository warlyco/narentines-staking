import type { NextApiHandler } from "next";
import request from "graphql-request";
import { FETCH_NFT } from "graphql/queries/fetch-nft";
import { UPDATE_NFTS_OWNER } from "graphql/mutations/update-nfts-owner";

const updateNftOwner: NextApiHandler = async (req, response) => {
  const { mintAddresses, walletAddress } = req.body;

  if (!mintAddresses || !walletAddress)
    throw new Error("Missing required fields");

  try {
    const { update_nfts } = await request({
      url: process.env.NEXT_PUBLIC_ADMIN_GRAPHQL_API_ENDPOINT!,
      document: UPDATE_NFTS_OWNER,
      variables: {
        mintAddresses,
        walletAddress,
        timestamp: new Date().toISOString(),
      },
      requestHeaders: {
        "x-hasura-admin-secret": process.env.HASURA_GRAPHQL_ADMIN_SECRET!,
      },
    });

    response.json({ nfts: update_nfts });
  } catch (error) {
    console.error(error);
    response.status(500).json({ error });
  }
};

export default updateNftOwner;
