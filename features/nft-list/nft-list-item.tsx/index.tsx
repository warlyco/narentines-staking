import { Nft } from "@metaplex-foundation/js";
import NftCard from "features/nft-card";

const NftListItem = ({ nft }: { nft: Nft }) => {
  return <NftCard nft={nft} />;
};

export default NftListItem;
