import { gql } from "graphql-request";

export const UPDATE_NFTS_HOLDER = gql`
  mutation UpdateNftsHolder(
    $mintAddresses: [String!]
    $walletAddress: String
    $timestamp: timestamptz = ""
    $professionId: uuid
  ) {
    update_nfts(
      where: { mintAddress: { _in: $mintAddresses } }
      _set: {
        holderWalletAddress: $walletAddress
        timestamp: $timestamp
        professionId: $professionId
      }
    ) {
      returning {
        holderWalletAddress
        image
        mintAddress
        name
        ownerWalletAddress
        timestamp
        uri
        professionId
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
  }
`;
