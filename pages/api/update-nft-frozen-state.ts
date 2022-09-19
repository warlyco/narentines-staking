import type { NextApiHandler } from "next";
import request from "graphql-request";
import { UPDATE_NFT_FROZEN_STATE } from "graphql/mutations/update-nft-frozen-state";

const updateNftFrozenState: NextApiHandler = async (req, response) => {
  const { mintAddress, isFrozen } = req.body;

  if (!mintAddress || !isFrozen) throw new Error("Missing required fields");

  try {
    const { update_nfts_by_pk } = await request({
      url: process.env.NEXT_PUBLIC_ADMIN_GRAPHQL_API_ENDPOINT!,
      document: UPDATE_NFT_FROZEN_STATE,
      variables: {
        mintAddress,
        isFrozen,
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

export default updateNftFrozenState;
