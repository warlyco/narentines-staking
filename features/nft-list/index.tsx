import { Nft } from "@metaplex-foundation/js";
import { CREATOR_ADDRESS } from "constants/constants";
import NftListItem from "./nft-list-item.tsx";

const NftList = ({ nfts }: { nfts: Nft[] }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 mb-8">
      {!!nfts &&
        nfts
          .filter(
            ({ creators }) =>
              creators?.[0]?.address?.toString() === CREATOR_ADDRESS
          )
          .map((nft) => <NftListItem nft={nft} key={String(nft.address)} />)}
    </div>
  );
};

export default NftList;
