import type { NextApiHandler } from "next";
import request from "graphql-request";
import { UPDATE_NFT_CLAIM_TIME } from "graphql/mutations/update-nft-claim-time";

const resetNftClaimTime: NextApiHandler = async (req, response) => {
  const { mintAddress } = req.body;

  if (!mintAddress) throw new Error("Missing required fields");

  try {
    const { update_nfts_by_pk } = await request({
      url: process.env.NEXT_PUBLIC_ADMIN_GRAPHQL_API_ENDPOINT!,
      document: UPDATE_NFT_CLAIM_TIME,
      variables: {
        mintAddress,
        lastClaimTimestamp: new Date().toISOString(),
      },
      requestHeaders: {
        "x-hasura-admin-secret": process.env.HASURA_GRAPHQL_ADMIN_SECRET!,
      },
    });
    console.log("claim updated", update_nfts_by_pk);
    response.json({ nft: update_nfts_by_pk });
  } catch (error) {
    console.error(error);
    response.status(500).json({ error });
    return;
  }
};

export default resetNftClaimTime;
