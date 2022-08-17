import { gql } from "graphql-request";

export const UPDATE_NFTS_OWNER = gql`
  mutation UpdateNftOwner(
    $mintAddresses: [String!]
    $walletAddress: String
    $timestamp: timestamptz
  ) {
    update_nfts(
      where: { mintAddress: { _in: $mintAddresses } }
      _set: { ownerWalletAddress: $walletAddress, timestamp: $timestamp }
    ) {
      returning {
        holderWalletAddress
        image
        mintAddress
        name
        ownerWalletAddress
        timestamp
        uri
      }
    }
  }
`;
