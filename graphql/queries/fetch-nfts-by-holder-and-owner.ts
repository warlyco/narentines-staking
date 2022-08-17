import gql from "graphql-tag";

export const FETCH_NFTS_BY_HOLDER_AND_OWNER = gql`
  query MyQuery($holderWalletAddress: String, $ownerWalletAddress: String) {
    nfts(
      where: {
        holderWalletAddress: { _eq: $holderWalletAddress }
        _and: { ownerWalletAddress: { _eq: $ownerWalletAddress } }
      }
    ) {
      timestamp
      ownerWalletAddress
      name
      mintAddress
      image
      holderWalletAddress
    }
  }
`;
