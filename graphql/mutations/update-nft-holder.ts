import { gql } from "graphql-request";

export const UPDATE_NFT_HOLDER = gql`
  mutation UpdateNftHolder(
    $mintAddress: String!
    $walletAddress: String!
    $timestamp: timestamptz!
    $professionId: uuid!
  ) {
    update_nfts_by_pk(
      pk_columns: { mintAddress: $mintAddress }
      _set: {
        holderWalletAddress: $walletAddress
        timestamp: $timestamp
        professionId: $professionId
      }
    ) {
      holderWalletAddress
      ownerWalletAddress
      image
      mintAddress
      name
      timestamp
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
