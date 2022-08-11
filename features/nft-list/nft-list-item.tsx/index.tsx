import { Nft } from "@metaplex-foundation/js";

const NftListItem = ({ nft }: { nft: Nft }) => {
  return <div key={String(nft.address)}>{JSON.stringify(nft)}</div>;
};

export default NftListItem;
