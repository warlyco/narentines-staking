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
      holderWalletAddress
      profession {
        name
        dailyRewardRate
        resource {
          image
          mintAddress
          name
        }
      }
    }
  }
`;
