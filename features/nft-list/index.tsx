import { Metadata, Nft } from "@metaplex-foundation/js";
import { CREATOR_ADDRESS } from "constants/constants";
import LoadingNftCard from "features/nft-card/loading-nft-card";
import { WalletTypes } from "types";
import NftListItem from "./nft-list-item.tsx";

type Props = {
  isLoadingNfts: boolean;
  nfts: Metadata[] | null;
  activeWallet: WalletTypes;
  fetchNfts: () => Promise<void>;
};
const NftList = ({ nfts, isLoadingNfts, activeWallet, fetchNfts }: Props) => {
  const emptyStateMessage =
    activeWallet === WalletTypes.USER
      ? "You have no Narentines in your wallet"
      : "You have no Narentines staked";
  return (
    <>
      {!isLoadingNfts && !nfts?.length && (
        <div className="w-full flex justify-center mt-32 text-3xl">
          <div>{emptyStateMessage}</div>
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 mb-8">
        {isLoadingNfts && <LoadingNftCard />}
        {!isLoadingNfts &&
          !!nfts &&
          nfts.map((nft) => (
            <NftListItem
              fetchNfts={fetchNfts}
              nft={nft}
              key={String(nft.mintAddress)}
              activeWallet={activeWallet}
            />
          ))}
      </div>
    </>
  );
};

export default NftList;
