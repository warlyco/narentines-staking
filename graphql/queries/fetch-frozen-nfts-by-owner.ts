import gql from "graphql-tag";

export const FETCH_FROZEN_NFTS_BY_OWNER = gql`
  query FetchFrozenNftsByOwner($ownerWalletAddress: String) {
    nfts(
      where: {
        ownerWalletAddress: { _eq: $ownerWalletAddress }
        _and: { isFrozen: { _eq: true } }
      }
    ) {
      timestamp
      lastClaimTimestamp
      ownerWalletAddress
      name
      mintAddress
      image
      profession {
        name
        dailyRewardRate
        id
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
