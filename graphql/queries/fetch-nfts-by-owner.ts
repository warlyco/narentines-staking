import gql from "graphql-tag";

export const FETCH_NFTS_BY_OWNER = gql`
  query FetchNftsByOwner($ownerWalletAddress: String) {
    nfts(where: { ownerWalletAddress: { _eq: $ownerWalletAddress } }) {
      timestamp
      ownerWalletAddress
      name
      mintAddress
      image
      holderWalletAddress
    }
  }
`;
