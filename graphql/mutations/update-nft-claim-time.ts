import { gql } from "graphql-request";

export const UPDATE_NFT_CLAIM_TIME = gql`
  mutation UpdateNftClaimTime(
    $mintAddress: String!
    $lastClaimTimestamp: timestamptz!
  ) {
    update_nfts_by_pk(
      pk_columns: { mintAddress: $mintAddress }
      _set: { lastClaimTimestamp: $lastClaimTimestamp }
    ) {
      ownerWalletAddress
      lastClaimTimestamp
      image
      mintAddress
      name
      timestamp
    }
  }
`;
