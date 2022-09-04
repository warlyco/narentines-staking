import gql from "graphql-tag";

export const FETCH_NFTS_BY_MINT_ADDRESSES = gql`
  query FetchNftsByMintAddresses($mintAddresses: [String!]) {
    nfts(where: { mintAddress: { _in: $mintAddresses } }) {
      timestamp
      lastClaimTimestamp
      ownerWalletAddress
      name
      mintAddress
      image
      holderWalletAddress
      profession {
        name
        dailyRewardRate
        resource {
          image
          mintAddress
          name
        }
      }
    }
  }
`;
