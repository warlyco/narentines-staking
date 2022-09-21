import { gql } from "graphql-request";

export const FETCH_NFT = gql`
  query FetchNft($mintAddress: String) {
    nfts(where: { mintAddress: { _eq: $mintAddress } }) {
      name
      image
      mintAddress
      timestamp
      lastClaimTimestamp
      ownerWalletAddress
    }
  }
`;
