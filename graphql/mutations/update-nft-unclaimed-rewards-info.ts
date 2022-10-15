import { gql } from "graphql-request";

export const UPDATE_NFT_UNCLAIMED_REWARDS_INFO = gql`
  mutation UPDATE_NFT_UNCLAIMED_REWARDS_INFO(
    $unclaimedRewardsAmount: float8
    $mintAddress: String!
    $rewardsLastCalculatedTimestamp: timestamptz
  ) {
    update_nfts_by_pk(
      pk_columns: { mintAddress: $mintAddress }
      _set: {
        unclaimedRewardsAmount: $unclaimedRewardsAmount
        rewardsLastCalculatedTimestamp: $rewardsLastCalculatedTimestamp
      }
    ) {
      unclaimedRewardsAmount
      mintAddress
    }
  }
`;
