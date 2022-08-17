import { gql } from "graphql-request";

export const UPDATE_NFT_HOLDER = gql`
  mutation UpdataeNftHolder(
    $mintAddress: String!
    $holderWalletAddress: String!
    $name: String!
    $timestamp: timestamptz!
  ) {
    update_nfts_by_pk(
      pk_columns: { mintAddress: $mintAddress }
      _set: {
        holderWalletAddress: $holderWalletAddress
        mintAddress: $mintAddress
        name: $name
        timestamp: $timestamp
      }
    ) {
      holderWalletAddress
      imgUrl
      mintAddress
      name
      timestamp
    }
  }
`;
