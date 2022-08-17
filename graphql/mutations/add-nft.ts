import { gql } from "graphql-request";

export const ADD_NFT = gql`
  mutation AddNft(
    $ownerWalletAddress: String
    $holderWalletAddress: String
    $image: String
    $mintAddress: String
    $name: String
  ) {
    insert_nfts_one(
      object: {
        ownerWalletAddress: $ownerWalletAddress
        holderWalletAddress: $holderWalletAddress
        image: $image
        mintAddress: $mintAddress
        name: $name
      }
      on_conflict: {
        constraint: nfts_pkey
        update_columns: holderWalletAddress
        where: {}
      }
    ) {
      ownerWalletAddress
      holderWalletAddress
      image
      mintAddress
      name
      timestamp
    }
  }
`;
