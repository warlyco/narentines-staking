import gql from "graphql-tag";

export const FETCH_NFTS_BY_HOLDER = gql`
  query FetchNftsByHolder($holderWalletAddress: String) {
    nfts(where: { holderWalletAddress: { _eq: $holderWalletAddress } }) {
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
