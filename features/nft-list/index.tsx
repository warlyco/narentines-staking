import { Nft } from "@metaplex-foundation/js";
import { CREATOR_ADDRESS } from "constants/constants";
import LoadingNftCard from "features/nft-card/loading-nft-card";
import { WalletTypes } from "types";
import NftListItem from "./nft-list-item.tsx";

type Props = {
  isLoadingNfts: boolean;
  nfts: Nft[] | null;
  activeWallet: WalletTypes;
};
const NftList = ({ nfts, isLoadingNfts, activeWallet }: Props) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 mb-8">
      {isLoadingNfts && <LoadingNftCard />}
      {!isLoadingNfts &&
        !!nfts &&
        nfts
          .filter(
            ({ creators }) =>
              creators?.[0]?.address?.toString() === CREATOR_ADDRESS
          )
          .map((nft) => (
            <NftListItem
              nft={nft}
              key={String(nft.address)}
              activeWallet={activeWallet}
            />
          ))}
    </div>
  );
};

export default NftList;
