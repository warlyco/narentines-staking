import { gql } from "graphql-request";

export const UPDATE_UNCLAIMED_REWARDS_AMOUNT = gql`
  mutation UPDATE_UNCLAIMED_REWARDS_AMOUNT(
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
