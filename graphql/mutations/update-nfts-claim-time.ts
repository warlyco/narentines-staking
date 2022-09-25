import { gql } from "graphql-request";

export const UPDATE_NFTS_CLAIM_TIME = gql`
  mutation UpdateNftsClaimTime(
    $mintAddresses: [String!]
    $lastClaimTimestamp: timestamptz!
  ) {
    update_nfts(
      where: { mintAddress: { _in: $mintAddresses } }
      _set: { lastClaimTimestamp: $lastClaimTimestamp }
    ) {
      returning {
        image
        isFrozen
        lastClaimTimestamp
        mintAddress
        name
        ownerWalletAddress
        timestamp
        uri
      }
    }
  }
`;
