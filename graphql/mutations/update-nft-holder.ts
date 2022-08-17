import { gql } from "graphql-request";

export const UPDATE_NFT_HOLDER = gql`
  mutation UpdataeNftHolder(
    $holderWalletAddress: String!
    $timestamp: timestamptz!
  ) {
    update_nfts_by_pk(
      pk_columns: { mintAddress: $mintAddress }
      _set: { holderWalletAddress: $holderWalletAddress, timestamp: $timestamp }
    ) {
      holderWalletAddress
      ownerWalletAddress
      image
      mintAddress
      name
      timestamp
    }
  }
`;
