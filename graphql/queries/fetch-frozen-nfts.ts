import gql from "graphql-tag";

export const FETCH_FROZEN_NFTS = gql`
  query FetchFrozenNfts {
    nfts(where: { isFrozen: { _eq: true } }) {
      timestamp
      lastClaimTimestamp
      ownerWalletAddress
      name
      mintAddress
      image
      unclaimedRewardsAmount
      rewardsLastCalculatedTimestamp
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
