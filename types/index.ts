import { JsonMetadata, Nft } from "@metaplex-foundation/js";

export type NftWithMeta = {
  nft: Nft;
  meta: JsonMetadata;
};

export enum WalletTypes {
  STAKING = "STAKING",
  USER = "USER",
}

export enum ModalTypes {
  SENDING_TRNASACTION = "SENDING_TRNASACTION",
}
