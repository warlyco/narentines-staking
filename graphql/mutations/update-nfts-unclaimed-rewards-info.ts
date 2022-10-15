import { gql } from "graphql-request";

export const UPDATE_NFTS_UNCLAIMED_REWARDS_INFO = gql`
  mutation UPDATE_NFTS_UNCLAIMED_REWARDS_INFO(
    $mintAddresses: [String!]
    $unclaimedRewardsAmount: float8
    $rewardsLastCalculatedTimestamp: timestamptz!
  ) {
    update_nfts(
      where: { mintAddress: { _in: $mintAddresses } }
      _set: {
        unclaimedRewardsAmount: $unclaimedRewardsAmount
        rewardsLastCalculatedTimestamp: $rewardsLastCalculatedTimestamp
      }
    ) {
      returning {
        image
        isFrozen
        unclaimedRewardsAmount
        rewardsLastCalculatedTimestamp
        mintAddress
        name
        ownerWalletAddress
        timestamp
        uri
      }
    }
  }
`;
