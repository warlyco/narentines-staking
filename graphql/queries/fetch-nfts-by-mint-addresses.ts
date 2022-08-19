import gql from "graphql-tag";

export const FETCH_NFTS_BY_MINT_ADDRESSES = gql`
  query FetchNftsByMintAddresses($mintAddresses: [String!]) {
    nfts(where: { mintAddress: { _in: $mintAddresses } }) {
      holderWalletAddress
      image
      mintAddress
      name
      ownerWalletAddress
      timestamp
      lastClaimTimestamp
    }
  }
`;
