import { gql } from "graphql-request";

export const ADD_NFT = gql`
  mutation AddNft(
    $image: String
    $mintAddress: String
    $name: String
    $uri: String
  ) {
    insert_nfts_one(
      object: {
        image: $image
        mintAddress: $mintAddress
        name: $name
        uri: $uri
      }
    ) {
      image
      mintAddress
      name
      uri
    }
  }
`;
