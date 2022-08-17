import { gql } from "graphql-request";

export const UPDATE_NFT_OWNER = gql`
  mutation UpdateNftOwner(
    $mintAddress: String!
    $walletAddress: String!
    $timestamp: timestamptz!
  ) {
    update_nfts_by_pk(
      pk_columns: { mintAddress: $mintAddress }
      _set: { ownerWalletAddress: $walletAddress, timestamp: $timestamp }
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
