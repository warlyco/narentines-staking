import { JsonMetadata, Nft } from "@metaplex-foundation/js";

export type NftWithMeta = {
  nft: Nft;
  meta: JsonMetadata;
};
