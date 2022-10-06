import type { NextApiHandler } from "next";
import request from "graphql-request";
import { UPDATE_NFTS_CLAIM_TIME } from "graphql/mutations/update-nfts-claim-time";

const resetNftsClaimTime: NextApiHandler = async (req, response) => {
  const { mintAddresses } = req.body;

  if (!mintAddresses) throw new Error("Missing required fields");

  try {
    const { update_nfts } = await request({
      url: process.env.NEXT_PUBLIC_ADMIN_GRAPHQL_API_ENDPOINT!,
      document: UPDATE_NFTS_CLAIM_TIME,
      variables: {
        mintAddresses,
        lastClaimTimestamp: new Date().toISOString(),
      },
      requestHeaders: {
        "x-hasura-admin-secret": process.env.HASURA_GRAPHQL_ADMIN_SECRET!,
      },
    });
    console.log("claim updated", update_nfts);
    response.json({ nft: update_nfts });
  } catch (error) {
    console.error(error);
    response.status(500).json({ error });
    return;
  }
};

export default resetNftsClaimTime;
