import { gql } from "graphql-request";

export const UPDATE_NFTS_FROZEN_STATE = gql`
  mutation UpdateNftsFrozenState(
    $mintAddresses: [String!]
    $isFrozen: Boolean!
  ) {
    update_nfts(
      where: { mintAddress: { _in: $mintAddresses } }
      _set: { isFrozen: $isFrozen }
    ) {
      ownerWalletAddress
      isFrozen
      image
      mintAddress
      name
      timestamp
    }
  }
`;
