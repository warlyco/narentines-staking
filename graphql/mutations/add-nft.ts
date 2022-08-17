import { gql } from "graphql-request";

export const ADD_NFT = gql`
  mutation AddNft(
    $holderWalletAddress: String
    $imgUrl: String
    $mintAddress: String
    $name: String
  ) {
    insert_nfts_one(
      object: {
        holderWalletAddress: $holderWalletAddress
        imgUrl: $imgUrl
        mintAddress: $mintAddress
        name: $name
      }
      on_conflict: {
        constraint: nfts_pkey
        update_columns: holderWalletAddress
        where: {}
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
