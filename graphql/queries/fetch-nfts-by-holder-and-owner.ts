import gql from "graphql-tag";

export const FETCH_NFTS_BY_HOLDER_AND_OWNER = gql`
  query FetchNftsByHolderAndOwner(
    $holderWalletAddress: String
    $ownerWalletAddress: String
  ) {
    nfts(
      where: {
        holderWalletAddress: { _eq: $holderWalletAddress }
        _and: { ownerWalletAddress: { _eq: $ownerWalletAddress } }
      }
    ) {
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
        id
        resource {
          id
          image
          mintAddress
          name
        }
      }
    }
  }
`;
