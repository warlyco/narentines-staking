import type { NextApiHandler } from "next";
import request from "graphql-request";
import { UPDATE_NFTS_FROZEN_STATE } from "graphql/mutations/update-nfts-frozen-state";

const updateNftsFrozenState: NextApiHandler = async (req, response) => {
  const { mintAddresses, isFrozen } = req.body;

  if (!mintAddresses || isFrozen === undefined)
    throw new Error("Missing required fields");

  try {
    const { update_nfts_by_pk } = await request({
      url: process.env.NEXT_PUBLIC_ADMIN_GRAPHQL_API_ENDPOINT!,
      document: UPDATE_NFTS_FROZEN_STATE,
      variables: {
        mintAddresses,
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

export default updateNftsFrozenState;
