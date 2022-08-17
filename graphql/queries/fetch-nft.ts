import { gql } from "graphql-request";

export const FETCH_NFT = gql`
  query MyQuery($mintAddress: String = "") {
    nfts(where: { mintAddress: { _eq: $mintAddress } }) {
      name
      imgUrl
      holderWalletAddress
      mintAddress
      timestamp
    }
  }
`;
