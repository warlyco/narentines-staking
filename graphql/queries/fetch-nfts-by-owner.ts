import gql from "graphql-tag";

export const FETCH_NFTS_BY_OWNER = gql`
  query FetchNftsByOwner($ownerWalletAddress: String) {
    nfts(where: { ownerWalletAddress: { _eq: $ownerWalletAddress } }) {
      timestamp
      lastClaimTimestamp
      ownerWalletAddress
      name
      mintAddress
      image
      isFrozen
      profession {
        name
        id
        dailyRewardRate
        resource {
          id
          image
          mintAddress
          name
        }
      }
    }
  }
`;
