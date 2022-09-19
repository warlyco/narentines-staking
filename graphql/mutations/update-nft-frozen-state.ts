import { gql } from "graphql-request";

export const UPDATE_NFT_FROZEN_STATE = gql`
  mutation UpdateNftFrozenState($mintAddress: String!, $isFrozen: Boolean!) {
    update_nfts_by_pk(
      pk_columns: { mintAddress: $mintAddress }
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
